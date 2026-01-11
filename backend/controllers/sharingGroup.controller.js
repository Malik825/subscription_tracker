import SharingGroup from "../models/sharingGroup.model.js";
import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { sendGroupInvitationEmail } from "../utils/send.email.js";

// ========== EXISTING CONTROLLERS (UPDATED) ==========

const createSharingGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const userId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Group name is required",
      });
    }

    const ownerMember = {
      user: userId,
      role: "owner",
      joinedAt: new Date(),
    };

    const membersList = [ownerMember];
    const invitationsList = [];

    // Create invitations instead of adding members directly
    if (members && Array.isArray(members)) {
      for (const memberEmail of members) {
        const user = await User.findOne({ email: memberEmail.trim() });
        if (user && user._id.toString() !== userId.toString()) {
          invitationsList.push({
            user: user._id,
            email: user.email,
            role: "member",
            invitedBy: userId,
            invitedAt: new Date(),
            status: "pending",
          });
        }
      }
    }

    const sharingGroup = await SharingGroup.create({
      name: name.trim(),
      description: description?.trim() || "",
      owner: userId,
      members: membersList,
      invitations: invitationsList,
      sharedSubscriptions: [],
      isActive: true,
    });

    await sharingGroup.populate("members.user", "username email");
    await sharingGroup.populate("invitations.user", "username email");
    await sharingGroup.populate("invitations.invitedBy", "username email");

    // Send invitation emails
    for (const invitation of invitationsList) {
      try {
        const invitedUser = await User.findById(invitation.user);
        if (invitedUser) {
          await sendGroupInvitationEmail({
            recipientEmail: invitedUser.email,
            recipientName: invitedUser.username,
            groupName: sharingGroup.name,
            inviterName: req.user.username,
          });
        }
      } catch (emailError) {
        console.error(`Failed to send invitation email:`, emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: "Sharing group created successfully",
      data: sharingGroup,
    });
  } catch (error) {
    console.error("Create sharing group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create sharing group",
      error: error.message,
    });
  }
};

const getUserSharingGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await SharingGroup.find({
      "members.user": userId,
      isActive: true,
    })
      .populate("members.user", "username email")
      .populate("sharedSubscriptions.subscription")
      .sort({ createdAt: -1 });

    const groupsWithCalculations = groups.map((group) => {
      const totalMonthly = group.sharedSubscriptions.reduce((sum, sub) => {
        if (sub.subscription && sub.subscription.price) {
          return sum + parseFloat(sub.subscription.price);
        }
        return sum;
      }, 0);

      const userShare = group.sharedSubscriptions.reduce((sum, sub) => {
        if (sub.subscription && sub.subscription.price) {
          const share = group.calculateUserShare(
            userId,
            parseFloat(sub.subscription.price)
          );
          return sum + share;
        }
        return sum;
      }, 0);

      return {
        ...group.toObject(),
        totalMonthly,
        userShare,
        memberCount: group.members.length,
        subscriptionCount: group.sharedSubscriptions.length,
      };
    });

    res.status(200).json({
      success: true,
      data: groupsWithCalculations,
    });
  } catch (error) {
    console.error("Get sharing groups error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve sharing groups",
      error: error.message,
    });
  }
};

const getSharingGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    const group = await SharingGroup.findById(id)
      .populate("members.user", "username email")
      .populate("sharedSubscriptions.subscription");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Sharing group not found",
      });
    }

    if (!group.isMember(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    const totalMonthly = group.sharedSubscriptions.reduce((sum, sub) => {
      if (sub.subscription && sub.subscription.price) {
        return sum + parseFloat(sub.subscription.price);
      }
      return sum;
    }, 0);

    const userShare = group.sharedSubscriptions.reduce((sum, sub) => {
      if (sub.subscription && sub.subscription.price) {
        const share = group.calculateUserShare(
          userId,
          parseFloat(sub.subscription.price)
        );
        return sum + share;
      }
      return sum;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        ...group.toObject(),
        totalMonthly,
        userShare,
        memberCount: group.members.length,
        subscriptionCount: group.sharedSubscriptions.length,
      },
    });
  } catch (error) {
    console.error("Get sharing group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve sharing group",
      error: error.message,
    });
  }
};

// Updated addMember - now creates invitation instead
const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role = "member" } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Member email is required",
      });
    }

    const group = await SharingGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Sharing group not found",
      });
    }

    if (!group.canManage(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only owner or admin can invite members",
      });
    }

    const newUser = await User.findOne({ email: email.trim() });

    if (!newUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (group.isMember(newUser._id)) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this group",
      });
    }

    if (group.hasPendingInvitation(newUser._id)) {
      return res.status(400).json({
        success: false,
        message: "User already has a pending invitation to this group",
      });
    }

    // Create invitation instead of adding directly
    group.invitations.push({
      user: newUser._id,
      email: newUser.email,
      role: role,
      invitedBy: userId,
      invitedAt: new Date(),
      status: "pending",
    });

    await group.save();
    await group.populate("invitations.user", "username email");
    await group.populate("invitations.invitedBy", "username email");

    // Send invitation email
    try {
      await sendGroupInvitationEmail({
        recipientEmail: newUser.email,
        recipientName: newUser.username,
        groupName: group.name,
        inviterName: req.user.username,
      });
    } catch (emailError) {
      console.error(`Failed to send invitation email:`, emailError);
    }

    res.status(200).json({
      success: true,
      message: "Invitation sent successfully",
      data: group,
    });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send invitation",
      error: error.message,
    });
  }
};

// ========== NEW INVITATION CONTROLLERS ==========

// Get user's pending invitations
const getUserInvitations = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await SharingGroup.find({
      "invitations.user": userId,
      "invitations.status": "pending",
      isActive: true,
    })
      .populate("owner", "username email")
      .populate("invitations.invitedBy", "username email")
      .populate("members.user", "username email");

    // Clean up expired invitations and filter
    const validInvitations = [];

    for (const group of groups) {
      group.cleanupExpiredInvitations();
      await group.save();

      const userInvitation = group.invitations.find(
        (inv) =>
          inv.user.toString() === userId.toString() && inv.status === "pending"
      );

      if (userInvitation) {
        validInvitations.push({
          _id: userInvitation._id,
          group: {
            _id: group._id,
            name: group.name,
            description: group.description,
            memberCount: group.members.length,
            subscriptionCount: group.sharedSubscriptions.length,
          },
          role: userInvitation.role,
          invitedBy: userInvitation.invitedBy,
          invitedAt: userInvitation.invitedAt,
          expiresAt: userInvitation.expiresAt,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: validInvitations,
    });
  } catch (error) {
    console.error("Get user invitations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve invitations",
      error: error.message,
    });
  }
};

// Accept invitation
const acceptInvitation = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    const group = await SharingGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Sharing group not found",
      });
    }

    const invitationIndex = group.invitations.findIndex(
      (inv) =>
        inv.user.toString() === userId.toString() && inv.status === "pending"
    );

    if (invitationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "No pending invitation found",
      });
    }

    const invitation = group.invitations[invitationIndex];

    // Check if invitation has expired
    if (new Date(invitation.expiresAt) <= new Date()) {
      invitation.status = "expired";
      await group.save();
      return res.status(400).json({
        success: false,
        message: "Invitation has expired",
      });
    }

    // Check if user is already a member
    if (group.isMember(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this group",
      });
    }

    // Add user as member
    group.members.push({
      user: userId,
      role: invitation.role,
      joinedAt: new Date(),
    });

    // Update invitation status
    invitation.status = "accepted";

    await group.save();
    await group.populate("members.user", "username email");

    res.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
      data: group,
    });
  } catch (error) {
    console.error("Accept invitation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept invitation",
      error: error.message,
    });
  }
};

// Decline invitation
const declineInvitation = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    const group = await SharingGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Sharing group not found",
      });
    }

    const invitationIndex = group.invitations.findIndex(
      (inv) =>
        inv.user.toString() === userId.toString() && inv.status === "pending"
    );

    if (invitationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "No pending invitation found",
      });
    }

    // Update invitation status to declined
    group.invitations[invitationIndex].status = "declined";

    await group.save();

    res.status(200).json({
      success: true,
      message: "Invitation declined successfully",
    });
  } catch (error) {
    console.error("Decline invitation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to decline invitation",
      error: error.message,
    });
  }
};

// Cancel invitation (by group admin/owner)
const cancelInvitation = async (req, res) => {
  try {
    const { groupId, invitationId } = req.params;
    const userId = req.user._id;

    if (
      !mongoose.Types.ObjectId.isValid(groupId) ||
      !mongoose.Types.ObjectId.isValid(invitationId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const group = await SharingGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Sharing group not found",
      });
    }

    if (!group.canManage(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only owner or admin can cancel invitations",
      });
    }

    const invitationIndex = group.invitations.findIndex(
      (inv) => inv._id.toString() === invitationId
    );

    if (invitationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    // Remove the invitation
    group.invitations.splice(invitationIndex, 1);

    await group.save();

    res.status(200).json({
      success: true,
      message: "Invitation cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel invitation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel invitation",
      error: error.message,
    });
  }
};

// Keep existing controllers
const updateSharingGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    const group = await SharingGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Sharing group not found",
      });
    }

    if (!group.canManage(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only owner or admin can update this group",
      });
    }

    const updateData = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();

    const updatedGroup = await SharingGroup.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("members.user", "username email")
      .populate("sharedSubscriptions.subscription");

    res.status(200).json({
      success: true,
      message: "Sharing group updated successfully",
      data: updatedGroup,
    });
  } catch (error) {
    console.error("Update sharing group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update sharing group",
      error: error.message,
    });
  }
};

const deleteSharingGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    const group = await SharingGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Sharing group not found",
      });
    }

    if (group.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the owner can delete this group",
      });
    }

    await SharingGroup.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Sharing group deleted successfully",
    });
  } catch (error) {
    console.error("Delete sharing group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete sharing group",
      error: error.message,
    });
  }
};

const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user._id;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(memberId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const group = await SharingGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Sharing group not found",
      });
    }

    if (group.owner.toString() === memberId) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove the group owner",
      });
    }

    if (!group.canManage(userId) && userId.toString() !== memberId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to remove this member",
      });
    }

    group.members = group.members.filter(
      (m) => m.user.toString() !== memberId.toString()
    );

    await group.save();
    await group.populate("members.user", "username email");

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      data: group,
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove member",
      error: error.message,
    });
  }
};

const addSubscriptionToGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { subscriptionId, splitType = "equal", customSplits } = req.body;
    const userId = req.user._id;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(subscriptionId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const group = await SharingGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Sharing group not found",
      });
    }

    if (!group.canManage(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only owner or admin can add subscriptions",
      });
    }

    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    const alreadyShared = group.sharedSubscriptions.some(
      (sub) => sub.subscription.toString() === subscriptionId
    );

    if (alreadyShared) {
      return res.status(400).json({
        success: false,
        message: "Subscription is already shared in this group",
      });
    }

    const sharedSub = {
      subscription: subscriptionId,
      splitType: splitType,
      customSplits: customSplits || [],
      addedAt: new Date(),
    };

    group.sharedSubscriptions.push(sharedSub);
    await group.save();
    await group.populate("sharedSubscriptions.subscription");

    res.status(200).json({
      success: true,
      message: "Subscription added to group successfully",
      data: group,
    });
  } catch (error) {
    console.error("Add subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add subscription to group",
      error: error.message,
    });
  }
};

const removeSubscriptionFromGroup = async (req, res) => {
  try {
    const { id, subscriptionId } = req.params;
    const userId = req.user._id;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(subscriptionId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const group = await SharingGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Sharing group not found",
      });
    }

    if (!group.canManage(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only owner or admin can remove subscriptions",
      });
    }

    group.sharedSubscriptions = group.sharedSubscriptions.filter(
      (sub) => sub.subscription.toString() !== subscriptionId
    );

    await group.save();
    await group.populate("sharedSubscriptions.subscription");

    res.status(200).json({
      success: true,
      message: "Subscription removed from group successfully",
      data: group,
    });
  } catch (error) {
    console.error("Remove subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove subscription from group",
      error: error.message,
    });
  }
};

const updateSplitConfiguration = async (req, res) => {
  try {
    const { id, subscriptionId } = req.params;
    const { splitType, customSplits } = req.body;
    const userId = req.user._id;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(subscriptionId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const group = await SharingGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Sharing group not found",
      });
    }

    if (!group.canManage(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only owner or admin can update split configuration",
      });
    }

    const subIndex = group.sharedSubscriptions.findIndex(
      (sub) => sub.subscription.toString() === subscriptionId
    );

    if (subIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found in group",
      });
    }

    if (splitType) {
      group.sharedSubscriptions[subIndex].splitType = splitType;
    }

    if (customSplits) {
      group.sharedSubscriptions[subIndex].customSplits = customSplits;
    }

    await group.save();
    await group.populate("sharedSubscriptions.subscription");

    res.status(200).json({
      success: true,
      message: "Split configuration updated successfully",
      data: group,
    });
  } catch (error) {
    console.error("Update split configuration error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update split configuration",
      error: error.message,
    });
  }
};

export {
  createSharingGroup,
  getUserSharingGroups,
  getSharingGroupById,
  updateSharingGroup,
  deleteSharingGroup,
  addMember,
  removeMember,
  addSubscriptionToGroup,
  removeSubscriptionFromGroup,
  updateSplitConfiguration,
  // New invitation exports
  getUserInvitations,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
};
