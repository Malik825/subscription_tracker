import mongoose from "mongoose";

const sharingGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      maxLength: [100, "Group name must be less than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, "Description must be less than 500 characters"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["owner", "admin", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // NEW: Pending invitations
    invitations: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        invitedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined", "expired"],
          default: "pending",
        },
        expiresAt: {
          type: Date,
          default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      },
    ],
    sharedSubscriptions: [
      {
        subscription: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subscription",
          required: true,
        },
        splitType: {
          type: String,
          enum: ["equal", "custom", "percentage"],
          default: "equal",
        },
        customSplits: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            amount: {
              type: Number,
              min: 0,
            },
            percentage: {
              type: Number,
              min: 0,
              max: 100,
            },
          },
        ],
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
sharingGroupSchema.index({ owner: 1 });
sharingGroupSchema.index({ "members.user": 1 });
sharingGroupSchema.index({ "invitations.user": 1 });
sharingGroupSchema.index({ "invitations.status": 1 });

// Virtual for total monthly cost
sharingGroupSchema.virtual("totalMonthly").get(function () {
  return 0; // Placeholder - calculated in controller
});

// Method to check if user is member
sharingGroupSchema.methods.isMember = function (userId) {
  const userIdStr = userId.toString();
  return this.members.some((member) => {
    const memberId = member.user._id
      ? member.user._id.toString()
      : member.user.toString();
    return memberId === userIdStr;
  });
};

// Method to check if user has pending invitation
sharingGroupSchema.methods.hasPendingInvitation = function (userId) {
  const userIdStr = userId.toString();
  return this.invitations.some((invite) => {
    const inviteUserId = invite.user._id
      ? invite.user._id.toString()
      : invite.user.toString();
    return (
      inviteUserId === userIdStr &&
      invite.status === "pending" &&
      new Date(invite.expiresAt) > new Date()
    );
  });
};

// Method to check if user is owner or admin
sharingGroupSchema.methods.canManage = function (userId) {
  const member = this.members.find((m) => {
    const memberId = m.user._id ? m.user._id.toString() : m.user.toString();
    return memberId === userId.toString();
  });
  return member && (member.role === "owner" || member.role === "admin");
};

// Method to calculate user's share
sharingGroupSchema.methods.calculateUserShare = function (
  userId,
  subscriptionPrice
) {
  if (!this.isMember(userId)) {
    return 0;
  }

  const activeMembers = this.members.filter((m) => m.user).length;

  if (activeMembers === 0) {
    return 0;
  }

  return subscriptionPrice / activeMembers;
};

// Method to clean up expired invitations
sharingGroupSchema.methods.cleanupExpiredInvitations = function () {
  const now = new Date();
  this.invitations = this.invitations.filter((invite) => {
    if (invite.status === "pending" && new Date(invite.expiresAt) <= now) {
      invite.status = "expired";
      return false;
    }
    return invite.status === "pending";
  });
};

const SharingGroup = mongoose.model("SharingGroup", sharingGroupSchema);

export default SharingGroup;
