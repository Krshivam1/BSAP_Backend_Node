const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubMenu = sequelize.define('SubMenu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  menuId: {
    type: DataTypes.INTEGER,
    field: 'menu_id',
    allowNull: false, 
    references: {
      model: 'menu',
      key: 'id'
    }
  },
  subMenuId: {
    type: DataTypes.INTEGER,
    field: 'sub_menu_id',
    allowNull: true
  },
  menuName: {
    type: DataTypes.STRING,
    field: 'menu_name',
    allowNull: false
  },
  menuUrl: {
    type: DataTypes.STRING,
    field: 'menu_url',
    allowNull: false 
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false, 
    defaultValue: 0
  },
  createdBy: {
    type: DataTypes.INTEGER,
    field: 'created_by',
    allowNull: false 
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    field: 'updated_by',
    allowNull: false 
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'sub_menu',
  timestamps: true,
  createdAt: 'created_date',
  updatedAt: 'updated_date'
});

// 🔥 ADD THESE ASSOCIATIONS
SubMenu.associate = function(models) {
  // Belongs to a Menu
  SubMenu.belongsTo(models.Menu, {
    foreignKey: 'menuId',
    as: 'menu'
  });
  
  // Self-referential: belongs to a parent SubMenu
  SubMenu.belongsTo(models.SubMenu, {
    foreignKey: 'subMenuId',
    as: 'parent'
  });
  
  // Self-referential: has many child SubMenus
  SubMenu.hasMany(models.SubMenu, {
    foreignKey: 'subMenuId',
    as: 'children'
  });
};

module.exports = SubMenu;



// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const SubMenu = sequelize.define('SubMenu', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   menuId: {
//     type: DataTypes.INTEGER,
//     field: 'menu_id',
//     allowNull: true,
//     references: {
//       model: 'menus',
//       key: 'id'
//     }
//   },
//   subMenuId: {
//     type: DataTypes.INTEGER,
//     field: 'sub_menu_id',
//     allowNull: true
//   },
//   menuName: {
//     type: DataTypes.STRING,
//     field: 'menu_name',
//     allowNull: false
//   },
//   menuUrl: {
//     type: DataTypes.STRING,
//     field: 'menu_url',
//     allowNull: true
//   },
//   priority: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     defaultValue: 0
//   },
//   createdBy: {
//     type: DataTypes.INTEGER,
//     field: 'created_by',
//     allowNull: true
//   },
//   updatedBy: {
//     type: DataTypes.INTEGER,
//     field: 'updated_by',
//     allowNull: true
//   },
//   active: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: true
//   }
// }, {
//   tableName: 'sub_menu',
//   timestamps: true,
//   createdAt: 'created_date',
//   updatedAt: 'updated_date'
// });

// module.exports = SubMenu;