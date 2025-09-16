const { 
  Communications, 
  CommunicationsMessage, 
  CommunicationsMessageUser, 
  CommunicationsUser, 
  CommunicationsAttachments,
  User 
} = require('../models');
const logger = require('../utils/logger');
const { Op, Sequelize } = require('sequelize');

class CommunicationService {
  /**
   * Get all communications
   * @param {Object} filters - Filter options
   * @returns {Array} Communications
   */
  async getAllCommunications(filters = {}) {
    const { active = true, page, limit } = filters;
    
    const whereCondition = { active };
    const options = {
      where: whereCondition,
      include: [
        {
          model: CommunicationsMessage,
          as: 'messages',
          include: [
            { model: CommunicationsAttachments, as: 'attachments' }
          ]
        },
        {
          model: CommunicationsUser,
          as: 'communicationUsers',
          include: [
            { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    };

    if (page && limit) {
      options.limit = limit;
      options.offset = (page - 1) * limit;
    }

    const communications = await Communications.findAll(options);
    return communications;
  }

  /**
   * Get communication by name
   * @param {string} communicationName - Communication name
   * @returns {Object} Communication
   */
  async getByName(communicationName) {
    const communication = await Communications.findOne({
      where: { 
        name: communicationName,
        active: true 
      },
      include: [
        {
          model: CommunicationsMessage,
          as: 'messages',
          include: [
            { model: CommunicationsAttachments, as: 'attachments' }
          ]
        },
        {
          model: CommunicationsUser,
          as: 'communicationUsers',
          include: [
            { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }
          ]
        }
      ]
    });

    return communication;
  }

  /**
   * Get communications for a specific user
   * @param {number} userId - User ID
   * @returns {Array} User communications
   */
  async getCommunicationsForUser(userId) {
    // Complex query to get communications where user is a participant
    const communications = await Communications.findAll({
      where: {
        active: true,
        id: {
          [Op.in]: Sequelize.literal(`(
            SELECT DISTINCT(communications_id) 
            FROM communications_message 
            WHERE active = 1 
            AND id IN (
              SELECT communications_message_id 
              FROM communications_message_user 
              WHERE user_id = ${userId} 
              ORDER BY update_status DESC
            )
          )`)
        }
      },
      include: [
        {
          model: CommunicationsMessage,
          as: 'messages',
          where: { active: true },
          include: [
            { 
              model: CommunicationsMessageUser, 
              as: 'messageUsers',
              where: { userId },
              required: false
            },
            { model: CommunicationsAttachments, as: 'attachments' }
          ],
          required: false
        },
        {
          model: CommunicationsUser,
          as: 'communicationUsers',
          include: [
            { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }
          ]
        }
      ],
      order: [['id', 'DESC']]
    });

    return communications;
  }

  /**
   * Get update status by communication ID and user ID
   * @param {number} communicationId - Communication ID
   * @param {number} userId - User ID
   * @returns {Array} Update statuses
   */
  async getUpdateStatusByCommunicationAndUser(communicationId, userId) {
    const statuses = await CommunicationsMessageUser.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('updateStatus')), 'updateStatus']],
      where: {
        userId,
        communicationsMessageId: {
          [Op.in]: Sequelize.literal(`(
            SELECT id 
            FROM communications_message 
            WHERE communications_id = ${communicationId}
          )`)
        }
      },
      order: [['updateStatus', 'ASC']],
      raw: true
    });

    return statuses.map(s => s.updateStatus);
  }

  /**
   * Create new communication
   * @param {Object} data - Communication data
   * @param {number} createdBy - User ID who created the communication
   * @returns {Object} Created communication
   */
  async createCommunication(data, createdBy) {
    const { name, description, userIds = [], messageData } = data;

    if (!name) {
      throw new Error('Communication name is required');
    }

    // Check if communication with same name exists
    const existingCommunication = await this.getByName(name);
    if (existingCommunication) {
      throw new Error('Communication with this name already exists');
    }

    // Create communication
    const communication = await Communications.create({
      name,
      description,
      active: true,
      createdBy
    });

    // Add users to communication
    if (userIds.length > 0) {
      const communicationUsers = userIds.map(userId => ({
        communicationsId: communication.id,
        userId,
        active: true
      }));

      await CommunicationsUser.bulkCreate(communicationUsers);
    }

    // Create initial message if provided
    if (messageData) {
      await this.createMessage(communication.id, messageData, createdBy);
    }

    logger.info(`Communication ${name} created by user ${createdBy}`);

    // Return communication with associations
    return await this.getCommunicationById(communication.id);
  }

  /**
   * Get communication by ID
   * @param {number} id - Communication ID
   * @returns {Object} Communication
   */
  async getCommunicationById(id) {
    const communication = await Communications.findByPk(id, {
      include: [
        {
          model: CommunicationsMessage,
          as: 'messages',
          include: [
            { model: CommunicationsAttachments, as: 'attachments' },
            {
              model: CommunicationsMessageUser,
              as: 'messageUsers',
              include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }
              ]
            }
          ]
        },
        {
          model: CommunicationsUser,
          as: 'communicationUsers',
          include: [
            { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }
          ]
        }
      ]
    });

    if (!communication || !communication.active) {
      throw new Error('Communication not found');
    }

    return communication;
  }

  /**
   * Update communication
   * @param {number} id - Communication ID
   * @param {Object} updateData - Update data
   * @param {number} updatedBy - User ID who updated the communication
   * @returns {Object} Updated communication
   */
  async updateCommunication(id, updateData, updatedBy) {
    const communication = await Communications.findByPk(id);
    if (!communication || !communication.active) {
      throw new Error('Communication not found');
    }

    await communication.update({
      ...updateData,
      updatedBy
    });

    logger.info(`Communication ${id} updated by user ${updatedBy}`);

    return await this.getCommunicationById(id);
  }

  /**
   * Delete communication (soft delete)
   * @param {number} id - Communication ID
   * @param {number} deletedBy - User ID who deleted the communication
   * @returns {Object} Response
   */
  async deleteCommunication(id, deletedBy) {
    const communication = await Communications.findByPk(id);
    if (!communication || !communication.active) {
      throw new Error('Communication not found');
    }

    await communication.update({
      active: false,
      updatedBy: deletedBy
    });

    logger.info(`Communication ${id} deleted by user ${deletedBy}`);

    return {
      success: true,
      message: 'Communication deleted successfully'
    };
  }

  /**
   * Create message in communication
   * @param {number} communicationId - Communication ID
   * @param {Object} messageData - Message data
   * @param {number} createdBy - User ID who created the message
   * @returns {Object} Created message
   */
  async createMessage(communicationId, messageData, createdBy) {
    const { message, userIds = [], attachments = [] } = messageData;

    if (!message) {
      throw new Error('Message content is required');
    }

    // Verify communication exists
    const communication = await Communications.findByPk(communicationId);
    if (!communication || !communication.active) {
      throw new Error('Communication not found');
    }

    // Create message
    const communicationMessage = await CommunicationsMessage.create({
      communicationsId: communicationId,
      message,
      active: true,
      createdBy
    });

    // Add message to users
    if (userIds.length > 0) {
      const messageUsers = userIds.map(userId => ({
        communicationsMessageId: communicationMessage.id,
        userId,
        updateStatus: 'UNREAD',
        active: true
      }));

      await CommunicationsMessageUser.bulkCreate(messageUsers);
    }

    // Add attachments
    if (attachments.length > 0) {
      const messageAttachments = attachments.map(attachment => ({
        communicationsMessageId: communicationMessage.id,
        fileName: attachment.fileName,
        filePath: attachment.filePath,
        fileSize: attachment.fileSize,
        fileType: attachment.fileType,
        active: true
      }));

      await CommunicationsAttachments.bulkCreate(messageAttachments);
    }

    logger.info(`Message created in communication ${communicationId} by user ${createdBy}`);

    return await this.getMessageById(communicationMessage.id);
  }

  /**
   * Get message by ID
   * @param {number} id - Message ID
   * @returns {Object} Message
   */
  async getMessageById(id) {
    const message = await CommunicationsMessage.findByPk(id, {
      include: [
        { model: CommunicationsAttachments, as: 'attachments' },
        {
          model: CommunicationsMessageUser,
          as: 'messageUsers',
          include: [
            { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }
          ]
        }
      ]
    });

    if (!message || !message.active) {
      throw new Error('Message not found');
    }

    return message;
  }

  /**
   * Update message read status
   * @param {number} messageId - Message ID
   * @param {number} userId - User ID
   * @param {string} status - Status (READ, UNREAD)
   * @returns {Object} Response
   */
  async updateMessageStatus(messageId, userId, status) {
    const messageUser = await CommunicationsMessageUser.findOne({
      where: {
        communicationsMessageId: messageId,
        userId
      }
    });

    if (!messageUser) {
      throw new Error('Message user record not found');
    }

    await messageUser.update({ updateStatus: status });

    logger.info(`Message ${messageId} status updated to ${status} for user ${userId}`);

    return {
      success: true,
      message: 'Message status updated successfully'
    };
  }

  /**
   * Add users to communication
   * @param {number} communicationId - Communication ID
   * @param {Array} userIds - Array of user IDs to add
   * @param {number} addedBy - User ID who added the users
   * @returns {Object} Response
   */
  async addUsersToCommunnication(communicationId, userIds, addedBy) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error('User IDs array is required');
    }

    // Verify communication exists
    const communication = await Communications.findByPk(communicationId);
    if (!communication || !communication.active) {
      throw new Error('Communication not found');
    }

    // Get existing users
    const existingUsers = await CommunicationsUser.findAll({
      where: {
        communicationsId: communicationId,
        active: true
      },
      attributes: ['userId']
    });

    const existingUserIds = existingUsers.map(u => u.userId);
    const newUserIds = userIds.filter(id => !existingUserIds.includes(id));

    if (newUserIds.length === 0) {
      return {
        success: true,
        message: 'All users are already part of this communication'
      };
    }

    // Add new users
    const communicationUsers = newUserIds.map(userId => ({
      communicationsId: communicationId,
      userId,
      active: true,
      createdBy: addedBy
    }));

    await CommunicationsUser.bulkCreate(communicationUsers);

    logger.info(`${newUserIds.length} users added to communication ${communicationId} by user ${addedBy}`);

    return {
      success: true,
      message: `${newUserIds.length} users added to communication successfully`
    };
  }

  /**
   * Remove user from communication
   * @param {number} communicationId - Communication ID
   * @param {number} userId - User ID to remove
   * @param {number} removedBy - User ID who removed the user
   * @returns {Object} Response
   */
  async removeUserFromCommunication(communicationId, userId, removedBy) {
    const communicationUser = await CommunicationsUser.findOne({
      where: {
        communicationsId: communicationId,
        userId,
        active: true
      }
    });

    if (!communicationUser) {
      throw new Error('User is not part of this communication');
    }

    await communicationUser.update({
      active: false,
      updatedBy: removedBy
    });

    logger.info(`User ${userId} removed from communication ${communicationId} by user ${removedBy}`);

    return {
      success: true,
      message: 'User removed from communication successfully'
    };
  }

  /**
   * Get communication statistics
   * @param {number} communicationId - Communication ID
   * @returns {Object} Communication statistics
   */
  async getCommunicationStatistics(communicationId) {
    const communication = await Communications.findByPk(communicationId);
    if (!communication || !communication.active) {
      throw new Error('Communication not found');
    }

    const totalMessages = await CommunicationsMessage.count({
      where: {
        communicationsId: communicationId,
        active: true
      }
    });

    const totalUsers = await CommunicationsUser.count({
      where: {
        communicationsId: communicationId,
        active: true
      }
    });

    const totalAttachments = await CommunicationsAttachments.count({
      include: [{
        model: CommunicationsMessage,
        as: 'message',
        where: {
          communicationsId: communicationId,
          active: true
        }
      }],
      where: { active: true }
    });

    // Get unread messages count per user
    const unreadMessages = await CommunicationsMessageUser.findAll({
      attributes: [
        'userId',
        [Sequelize.fn('COUNT', Sequelize.col('CommunicationsMessageUser.id')), 'unreadCount']
      ],
      include: [{
        model: CommunicationsMessage,
        as: 'message',
        where: {
          communicationsId: communicationId,
          active: true
        },
        attributes: []
      }],
      where: {
        updateStatus: 'UNREAD',
        active: true
      },
      group: ['userId'],
      raw: true
    });

    return {
      totalMessages,
      totalUsers,
      totalAttachments,
      unreadMessages
    };
  }

  /**
   * Search communications
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Array} Matching communications
   */
  async searchCommunications(searchTerm, filters = {}) {
    const { userId } = filters;
    
    const whereCondition = {
      active: true,
      [Op.or]: [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } }
      ]
    };

    const include = [
      {
        model: CommunicationsMessage,
        as: 'messages',
        where: { active: true },
        required: false,
        include: [
          { model: CommunicationsAttachments, as: 'attachments' }
        ]
      },
      {
        model: CommunicationsUser,
        as: 'communicationUsers',
        include: [
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }
        ]
      }
    ];

    // Filter by user if specified
    if (userId) {
      include[1].where = { userId, active: true };
    }

    const communications = await Communications.findAll({
      where: whereCondition,
      include,
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    return communications;
  }
}

module.exports = new CommunicationService();