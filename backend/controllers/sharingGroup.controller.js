import SharingGroup from "../models/sharingGroup.model.js";
import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

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

    if (members && Array.isArray(members)) {
      for (const memberEmail of members) {
        const user = await User.findOne({ email: memberEmail.trim() });
        if (user && user._id.toString() !== userId.toString()) {
          membersList.push({
            user: user._id,
            role: "member",
            joinedAt: new Date(),
          });
        }
      }
    }

    const sharingGroup = await SharingGroup.create({
      name: name.trim(),
      description: description?.trim() || "",
      owner: userId,
      members: membersList,
      sharedSubscriptions: [],
      isActive: true,
    });

    await sharingGroup.populate("members.user", "username email");

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

// Add this to your getSharingGroupById function for debugging

const getSharingGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    console.log("\n=== DEBUG: Get Sharing Group ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Group ID:", id);
    console.log("Authenticated User ID:", userId.toString());
    console.log("User Email:", req.user.email);
    console.log("User Username:", req.user.username);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("❌ Invalid group ID format");
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    const group = await SharingGroup.findById(id)
      .populate("members.user", "username email")
      .populate("sharedSubscriptions.subscription");

    if (!group) {
      console.log("❌ Group not found in database");
      return res.status(404).json({
        success: false,
        message: "Sharing group not found",
      });
    }

    console.log("✓ Group found:", group.name);
    console.log("Group Owner:", group.owner.toString());
    console.log("Total Members:", group.members.length);
    console.log("Group members:");
    group.members.forEach((member, index) => {
      const isCurrentUser = member.user._id.toString() === userId.toString();
      console.log(
        `  ${index + 1}. ${
          isCurrentUser ? ">>> " : ""
        }User ID: ${member.user._id.toString()}`
      );
      console.log(`     Role: ${member.role}`);
      console.log(`     Username: ${member.user.username}`);
      console.log(`     Email: ${member.user.email}`);
      console.log(`     Match: ${isCurrentUser ? "YES ✓" : "NO"}`);
    });

    // Check membership
    const isMemberResult = group.isMember(userId);
    console.log("\nMembership check result:", isMemberResult);

    if (!isMemberResult) {
      console.log("❌ ACCESS DENIED - User is not a member");
      console.log("Expected to find:", userId.toString());
      console.log(
        "In members list:",
        group.members.map((m) => m.user._id.toString())
      );

      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    console.log("✓ ACCESS GRANTED - User is a member\n");

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
        message: "Only owner or admin can add members",
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

    group.members.push({
      user: newUser._id,
      role: role,
      joinedAt: new Date(),
    });

    await group.save();
    await group.populate("members.user", "username email");

    res.status(200).json({
      success: true,
      message: "Member added successfully",
      data: group,
    });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add member",
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
};
