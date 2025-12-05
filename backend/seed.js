import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './models/Account.js';
import Proxy from './models/Proxy.js';
import ColumnConfig from './models/ColumnConfig.js';
import Settings from './models/Settings.js';
import User from './models/User.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'mmo_accounts'
    });
    
    console.log('✓ Connected to MongoDB');

    // Xóa dữ liệu cũ
    await Account.deleteMany({});
    await Proxy.deleteMany({});
    await ColumnConfig.deleteMany({});
    await Settings.deleteMany({});
    await User.deleteMany({});
    console.log('✓ Cleared old data');

    // Tạo security settings
    await Settings.create({
      key: 'delete_protection_code',
      value: 'admin123',
      description: 'Mã bảo vệ để xóa tài khoản. Thay đổi trực tiếp trong MongoDB để bảo mật.'
    });
    console.log('✓ Created security settings (delete code: admin123)');

    // Tạo users
    const users = await User.create([
      {
        name: 'Admin',
        email: 'admin@example.com',
        color: '#EF4444', // Red
        status: 'active'
      },
      {
        name: 'User 1',
        email: 'user1@example.com',
        color: '#3B82F6', // Blue
        status: 'active'
      },
      {
        name: 'User 2',
        email: 'user2@example.com',
        color: '#10B981', // Green
        status: 'active'
      }
    ]);
    console.log(`✓ Created ${users.length} users`);

    // Tạo proxies
    const proxies = await Proxy.create([
      {
        ip: '192.168.1.100',
        port: 8080,
        type: 'http',
        country: 'Vietnam',
        status: 'active'
      },
      {
        ip: '192.168.1.101',
        port: 8080,
        username: 'proxyuser',
        password: 'proxypass',
        type: 'socks5',
        country: 'USA',
        status: 'active'
      },
      {
        ip: '192.168.1.102',
        port: 3128,
        type: 'http',
        country: 'Singapore',
        status: 'active'
      }
    ]);
    console.log(`✓ Created ${proxies.length} proxies`);

    // Tạo custom columns
    const columns = await ColumnConfig.create([
      {
        name: 'Tên',
        label: 'Tên',
        type: 'text',
        order: 0,
        visible: true,
        width: 150
      },
      {
        name: 'phone_number',
        label: 'Số điện thoại',
        type: 'text',
        order: 1,
        visible: true,
        width: 150
      },
      {
        name: 'vip_level',
        label: 'VIP Level',
        type: 'select',
        options: ['Free', 'VIP 1', 'VIP 2', 'VIP 3', 'VIP MAX'],
        order: 2,
        visible: true,
        width: 120
      },
      {
        name: 'registration_date',
        label: 'Ngày đăng ký',
        type: 'date',
        order: 3,
        visible: true,
        width: 150
      }
    ]);
    console.log(`✓ Created ${columns.length} custom columns`);

    // Tạo accounts
    const accounts = await Account.create([
      {
        userId: users[0]._id, // Admin
        customFields: {
          'Tên': 'Tài khoản 1',
          phone_number: '+84 123 456 789',
          vip_level: 'VIP 2',
          registration_date: '2024-01-15'
        },
        proxy: proxies[0]._id
      },
      {
        userId: users[1]._id, // User 1
        customFields: {
          'Tên': 'Tài khoản 2',
          phone_number: '+84 987 654 321',
          vip_level: 'VIP MAX',
          registration_date: '2024-02-20'
        },
        proxy: proxies[1]._id
      },
      {
        userId: users[1]._id, // User 1
        customFields: {
          'Tên': 'Tài khoản 3',
          phone_number: '+84 555 111 222',
          vip_level: 'VIP 1',
          registration_date: '2024-03-10'
        }
      },
      {
        userId: users[2]._id, // User 2
        customFields: {
          'Tên': 'Tài khoản 4',
          phone_number: '+84 333 444 555',
          vip_level: 'Free',
          registration_date: '2024-11-01'
        }
      }
    ]);
    console.log(`✓ Created ${accounts.length} accounts`);

    // Cập nhật proxy assignments
    await Proxy.updateOne({ _id: proxies[0]._id }, { assignedTo: accounts[0]._id });
    await Proxy.updateOne({ _id: proxies[1]._id }, { assignedTo: accounts[1]._id });
    console.log('✓ Updated proxy assignments');

    console.log('\n🎉 Seed data created successfully!');
    console.log('\nSummary:');
    console.log(`- ${users.length} users`);
    console.log(`- ${accounts.length} accounts`);
    console.log(`- ${proxies.length} proxies (${proxies.filter(p => p.assignedTo).length} assigned, ${proxies.length - 2} available)`);
    console.log(`- ${columns.length} custom columns`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
