'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed States
    const states = [
      { id: 1, name: 'Andhra Pradesh', code: 'AP', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Arunachal Pradesh', code: 'AR', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'Assam', code: 'AS', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: 'Bihar', code: 'BR', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 5, name: 'Chhattisgarh', code: 'CG', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 6, name: 'Goa', code: 'GA', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 7, name: 'Gujarat', code: 'GJ', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 8, name: 'Haryana', code: 'HR', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 9, name: 'Himachal Pradesh', code: 'HP', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 10, name: 'Jharkhand', code: 'JH', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 11, name: 'Karnataka', code: 'KA', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 12, name: 'Kerala', code: 'KL', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 13, name: 'Madhya Pradesh', code: 'MP', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 14, name: 'Maharashtra', code: 'MH', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 15, name: 'Manipur', code: 'MN', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 16, name: 'Meghalaya', code: 'ML', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 17, name: 'Mizoram', code: 'MZ', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 18, name: 'Nagaland', code: 'NL', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 19, name: 'Odisha', code: 'OR', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 20, name: 'Punjab', code: 'PB', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 21, name: 'Rajasthan', code: 'RJ', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 22, name: 'Sikkim', code: 'SK', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 23, name: 'Tamil Nadu', code: 'TN', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 24, name: 'Telangana', code: 'TG', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 25, name: 'Tripura', code: 'TR', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 26, name: 'Uttar Pradesh', code: 'UP', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 27, name: 'Uttarakhand', code: 'UK', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 28, name: 'West Bengal', code: 'WB', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 29, name: 'Delhi', code: 'DL', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 30, name: 'Jammu and Kashmir', code: 'JK', isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ];

    await queryInterface.bulkInsert('States', states, {});

    // Seed some sample Districts (focusing on major states)
    const districts = [
      // Andhra Pradesh
      { name: 'Visakhapatnam', code: 'VSK', stateId: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Vijayawada', code: 'VJA', stateId: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Guntur', code: 'GNT', stateId: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tirupati', code: 'TPT', stateId: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      
      // Karnataka
      { name: 'Bengaluru Urban', code: 'BLR', stateId: 11, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mysuru', code: 'MYS', stateId: 11, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mangaluru', code: 'MNG', stateId: 11, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Hubli-Dharwad', code: 'HUB', stateId: 11, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      
      // Maharashtra
      { name: 'Mumbai', code: 'MUM', stateId: 14, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pune', code: 'PUN', stateId: 14, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Nagpur', code: 'NGP', stateId: 14, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Nashik', code: 'NSK', stateId: 14, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      
      // Tamil Nadu
      { name: 'Chennai', code: 'CHN', stateId: 23, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Coimbatore', code: 'CBE', stateId: 23, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Madurai', code: 'MDU', stateId: 23, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tiruchirappalli', code: 'TRY', stateId: 23, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      
      // Uttar Pradesh
      { name: 'Lucknow', code: 'LKO', stateId: 26, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kanpur', code: 'KNP', stateId: 26, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Ghaziabad', code: 'GZB', stateId: 26, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Agra', code: 'AGR', stateId: 26, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      
      // West Bengal
      { name: 'Kolkata', code: 'KOL', stateId: 28, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Howrah', code: 'HWH', stateId: 28, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Durgapur', code: 'DGP', stateId: 28, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Asansol', code: 'ASN', stateId: 28, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      
      // Delhi
      { name: 'New Delhi', code: 'NDL', stateId: 29, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'North Delhi', code: 'NDD', stateId: 29, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'South Delhi', code: 'SDD', stateId: 29, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'East Delhi', code: 'EDD', stateId: 29, isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ];

    await queryInterface.bulkInsert('Districts', districts, {});

    // Get district IDs for range seeding
    const insertedDistricts = await queryInterface.sequelize.query(
      'SELECT id, name, stateId FROM Districts ORDER BY id',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Seed some sample Ranges
    const ranges = [];
    insertedDistricts.forEach((district, index) => {
      // Add 2-3 ranges per district
      for (let i = 1; i <= 2; i++) {
        ranges.push({
          name: `${district.name} Range ${i}`,
          code: `${district.name.substring(0, 3).toUpperCase()}R${i}`,
          stateId: district.stateId,
          districtId: district.id,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });

    await queryInterface.bulkInsert('Ranges', ranges, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Ranges', null, {});
    await queryInterface.bulkDelete('Districts', null, {});
    await queryInterface.bulkDelete('States', null, {});
  }
};