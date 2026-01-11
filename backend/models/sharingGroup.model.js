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

// Index for faster queries
sharingGroupSchema.index({ owner: 1 });
sharingGroupSchema.index({ "members.user": 1 });

// Virtual for total monthly cost
sharingGroupSchema.virtual("totalMonthly").get(function () {
  // This would be calculated based on shared subscriptions
  return 0; // Placeholder
});

// Method to check if user is member - FIXED to handle both populated and unpopulated users
sharingGroupSchema.methods.isMember = function (userId) {
  // Convert userId to string for comparison
  const userIdStr = userId.toString();

  // Check if user is in members array
  // Handle both populated (user is object with _id) and unpopulated (user is ObjectId) cases
  const isMember = this.members.some((member) => {
    // If member.user is populated (an object), use member.user._id
    // If member.user is just an ObjectId, use it directly
    const memberId = member.user._id
      ? member.user._id.toString()
      : member.user.toString();
    return memberId === userIdStr;
  });

  return isMember;
};

// Method to check if user is owner or admin - FIXED to handle populated users
sharingGroupSchema.methods.canManage = function (userId) {
  const member = this.members.find((m) => {
    const memberId = m.user._id ? m.user._id.toString() : m.user.toString();
    return memberId === userId.toString();
  });
  return member && (member.role === "owner" || member.role === "admin");
};

// Method to calculate user's share - FIXED VERSION
sharingGroupSchema.methods.calculateUserShare = function (
  userId,
  subscriptionPrice
) {
  // Check if user is a member first
  if (!this.isMember(userId)) {
    return 0;
  }

  // For equal split (most common case)
  const activeMembers = this.members.filter((m) => m.user).length;

  if (activeMembers === 0) {
    return 0;
  }

  // Simple equal split by default
  return subscriptionPrice / activeMembers;
};

const SharingGroup = mongoose.model("SharingGroup", sharingGroupSchema);

export default SharingGroup;
