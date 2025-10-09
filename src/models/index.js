const User = require('./User');
const Role = require('./Role');
const State = require('./State');
const District = require('./District');
const Range = require('./Range');
const Battalion = require('./Battalion');
const Menu = require('./Menu');
const SubMenu = require('./SubMenu');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const RoleMenu = require('./RoleMenu');
const RoleSubMenu = require('./RoleSubMenu');
const Module = require('./Module');
const Topic = require('./Topic');
const SubTopic = require('./SubTopic');
const Question = require('./Question');
const PerformanceStatistic = require('./PerformanceStatistic');
const Communications = require('./Communications');
const CIDCrimeCategory = require('./CIDCrimeCategory');
const CIDCrimeData = require('./CIDCrimeData');

// User associations
User.belongsTo(Role, {
  foreignKey: 'roleId',
  as: 'role'
});

User.belongsTo(State, {
  foreignKey: 'stateId',
  as: 'state'
});

User.belongsTo(Range, {
  foreignKey: 'rangeId',
  as: 'range'
});

// User.belongsTo(District, {
//   foreignKey: 'districtId',
//   as: 'district'
// });
User.belongsTo(Battalion, {
  foreignKey: 'battalionId',
  as: 'battalion'
});
// Role associations
Role.hasMany(User, {
  foreignKey: 'roleId',
  as: 'users'
});


Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions'
});

Role.belongsToMany(Menu, {
  through: RoleMenu,
  foreignKey: 'roleId',
  otherKey: 'menuId',
  as: 'menus'
});

Role.belongsToMany(SubMenu, {
  through: RoleSubMenu,
  foreignKey: 'roleId',
  otherKey: 'subMenuId',
  as: 'subMenus'
});

// Permission associations
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permissionId',
  otherKey: 'roleId',
  as: 'roles'
});

// RolePermission associations (for eager loading)
RolePermission.belongsTo(Permission, {
  foreignKey: 'permissionId',
  as: 'permission'
});

RolePermission.belongsTo(Role, {
  foreignKey: 'roleId',
  as: 'role'
});

// Menu associations
Menu.belongsToMany(Role, {
  through: RoleMenu,
  foreignKey: 'menuId',
  otherKey: 'roleId',
  as: 'roles'
});

Menu.hasMany(SubMenu, {
  foreignKey: 'menuId',
  as: 'subMenus'
});

// SubMenu associations
SubMenu.belongsTo(Menu, {
  foreignKey: 'menuId',
  as: 'menu'
});

SubMenu.hasMany(Module, {
  foreignKey: 'subMenuId',
  as: 'modules'
});

SubMenu.hasMany(Topic, {
  foreignKey: 'subMenuId',
  as: 'topics'
});

SubMenu.belongsToMany(Role, {
  through: RoleSubMenu,
  foreignKey: 'subMenuId',
  otherKey: 'roleId',
  as: 'roles'
});

// RoleSubMenu associations (for eager loading)
RoleSubMenu.belongsTo(SubMenu, {
  foreignKey: 'subMenuId',
  as: 'subMenu'
});

RoleSubMenu.belongsTo(Role, {
  foreignKey: 'roleId',
  as: 'role'
});

// State associations
State.hasMany(Range, {
  foreignKey: 'stateId',
  as: 'ranges'
});

State.hasMany(User, {
  foreignKey: 'stateId',
  as: 'users'
});

// Range associations
Range.belongsTo(State, {
  foreignKey: 'stateId',
  as: 'state'
});

// Range.hasMany(District, {
//   foreignKey: 'rangeId',
//   as: 'districts'
// });

Range.hasMany(User, {
  foreignKey: 'rangeId',
  as: 'users'
});

// Battalion associations
Battalion.belongsTo(Range, {
  foreignKey: 'rangeId',
  as: 'range'
});

Battalion.belongsTo(District, {
  foreignKey: 'districtId',
  as: 'district'
});

Range.hasMany(Battalion, {
  foreignKey: 'rangeId',
  as: 'battalions'
});

District.hasMany(Battalion, {
  foreignKey: 'districtId',
  as: 'battalions'
});

// Module associations
Module.belongsTo(SubMenu, {
  foreignKey: 'subMenuId',
  as: 'subMenu'
});

Module.hasMany(Topic, {
  foreignKey: 'moduleId',
  as: 'topics'
});

// Topic associations
Topic.belongsTo(Module, {
  foreignKey: 'moduleId',
  as: 'module'
});

Topic.belongsTo(SubMenu, {
  foreignKey: 'subMenuId',
  as: 'subMenu'
});

Topic.hasMany(SubTopic, {
  foreignKey: 'topicId',
  as: 'subTopics'
});

Topic.hasMany(Question, {
  foreignKey: 'topicId',
  as: 'questions'
});

// SubTopic associations
SubTopic.belongsTo(Topic, {
  foreignKey: 'topicId',
  as: 'topic'
});

SubTopic.hasMany(Question, {
  foreignKey: 'subTopicId',
  as: 'questions'
});

// Question associations
Question.belongsTo(Topic, {
  foreignKey: 'topicId',
  as: 'topic'
});

Question.belongsTo(SubTopic, {
  foreignKey: 'subTopicId',
  as: 'subTopic'
});

// PerformanceStatistic associations
PerformanceStatistic.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

PerformanceStatistic.belongsTo(State, {
  foreignKey: 'stateId',
  as: 'state'
});

PerformanceStatistic.belongsTo(Range, {
  foreignKey: 'rangeId',
  as: 'range'
});

PerformanceStatistic.belongsTo(Module, {
  foreignKey: 'moduleId',
  as: 'module'
});

PerformanceStatistic.belongsTo(Topic, {
  foreignKey: 'topicId',
  as: 'topic'
});

PerformanceStatistic.belongsTo(SubTopic, {
  foreignKey: 'subTopicId',
  as: 'subTopic'
});

PerformanceStatistic.belongsTo(Question, {
  foreignKey: 'questionId',
  as: 'question'
});

// CID Crime associations
CIDCrimeData.belongsTo(CIDCrimeCategory, {
  foreignKey: 'cidCrimeCategoryId',
  as: 'crimeCategory'
});

CIDCrimeCategory.hasMany(CIDCrimeData, {
  foreignKey: 'cidCrimeCategoryId',
  as: 'crimeData'
});

module.exports = {
  User,
  Role,
  State,
  District,
  Range,
  Battalion,
  Menu,
  SubMenu,
  Permission,
  RolePermission,
  RoleMenu,
  RoleSubMenu,
  Module,
  Topic,
  SubTopic,
  Question,
  PerformanceStatistic,
  Communications,
  CIDCrimeCategory,
  CIDCrimeData
};