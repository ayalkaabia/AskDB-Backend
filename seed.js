const { pool } = require('./backend/utils/database');

async function seedDatabase() {
  console.log('🌱 Seeding database with sample data...');
  
  try {
    const connection = await pool.getConnection();
    
    // Create sample tables
    console.log('📊 Creating sample tables...');
    
    // Create customers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        city VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create products table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(50),
        stock_quantity INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create orders table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `);
    
    // Create order_items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        product_id INT,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    
    // Create sales table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT,
        amount DECIMAL(10,2) NOT NULL,
        year INT NOT NULL,
        month INT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    
    console.log('✅ Tables created successfully');
    
    // Insert sample data
    console.log('📝 Inserting sample data...');
    
    // Insert customers
    await connection.execute(`
      INSERT INTO customers (name, email, city) VALUES 
      ('John Smith', 'john@example.com', 'New York'),
      ('Mary Johnson', 'mary@example.com', 'Boston'),
      ('David Wilson', 'david@example.com', 'Chicago'),
      ('Sarah Brown', 'sarah@example.com', 'Los Angeles'),
      ('Michael Davis', 'michael@example.com', 'Houston')
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);
    
    // Insert products
    await connection.execute(`
      INSERT INTO products (name, price, category, stock_quantity) VALUES 
      ('Laptop X', 1200.00, 'Electronics', 50),
      ('Monitor Y', 300.00, 'Electronics', 100),
      ('Keyboard Z', 80.00, 'Electronics', 200),
      ('Mouse A', 25.00, 'Electronics', 150),
      ('Headphones B', 150.00, 'Electronics', 75),
      ('Desk Chair', 200.00, 'Furniture', 30),
      ('Office Desk', 400.00, 'Furniture', 20),
      ('Coffee Mug', 15.00, 'Kitchen', 500)
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);
    
    // Insert orders
    await connection.execute(`
      INSERT INTO orders (customer_id, total_amount, status) VALUES 
      (1, 1500.00, 'completed'),
      (2, 800.00, 'completed'),
      (3, 1200.00, 'completed'),
      (4, 600.00, 'pending'),
      (5, 900.00, 'completed'),
      (1, 400.00, 'completed'),
      (2, 300.00, 'completed'),
      (3, 700.00, 'completed')
      ON DUPLICATE KEY UPDATE total_amount = VALUES(total_amount)
    `);
    
    // Insert order items
    await connection.execute(`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES 
      (1, 1, 1, 1200.00),
      (1, 2, 1, 300.00),
      (2, 3, 2, 80.00),
      (2, 4, 4, 25.00),
      (2, 5, 1, 150.00),
      (3, 1, 1, 1200.00),
      (4, 6, 1, 200.00),
      (4, 7, 1, 400.00),
      (5, 2, 2, 300.00),
      (5, 3, 1, 80.00),
      (5, 4, 2, 25.00),
      (6, 8, 10, 15.00),
      (6, 6, 1, 200.00),
      (7, 5, 2, 150.00),
      (8, 1, 1, 1200.00),
      (8, 2, 1, 300.00)
      ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)
    `);
    
    // Insert sales data
    await connection.execute(`
      INSERT INTO sales (product_id, amount, year, month) VALUES 
      (1, 12000.00, 2025, 1),
      (2, 9000.00, 2025, 1),
      (3, 4000.00, 2025, 1),
      (4, 1250.00, 2025, 1),
      (5, 4500.00, 2025, 1),
      (1, 15000.00, 2025, 2),
      (2, 12000.00, 2025, 2),
      (3, 6000.00, 2025, 2),
      (4, 2000.00, 2025, 2),
      (5, 6000.00, 2025, 2),
      (6, 3000.00, 2025, 1),
      (7, 2000.00, 2025, 1),
      (8, 1500.00, 2025, 1),
      (6, 4000.00, 2025, 2),
      (7, 3000.00, 2025, 2),
      (8, 2000.00, 2025, 2)
      ON DUPLICATE KEY UPDATE amount = VALUES(amount)
    `);
    
    console.log('✅ Sample data inserted successfully');
    
    // Show table information
    console.log('\n📋 Database Summary:');
    
    const [customers] = await connection.execute('SELECT COUNT(*) as count FROM customers');
    const [products] = await connection.execute('SELECT COUNT(*) as count FROM products');
    const [orders] = await connection.execute('SELECT COUNT(*) as count FROM orders');
    const [sales] = await connection.execute('SELECT COUNT(*) as count FROM sales');
    
    console.log(`👥 Customers: ${customers[0].count}`);
    console.log(`📦 Products: ${products[0].count}`);
    console.log(`📋 Orders: ${orders[0].count}`);
    console.log(`💰 Sales Records: ${sales[0].count}`);
    
    // Show sample queries that will work
    console.log('\n🧪 Sample Queries You Can Test:');
    console.log('1. "Get top 5 selling products this year"');
    console.log('2. "List all customers"');
    console.log('3. "Count total orders"');
    console.log('4. "Average price of products"');
    console.log('5. "Total revenue"');
    console.log('6. "SELECT * FROM customers LIMIT 5;"');
    console.log('7. "SELECT name, price FROM products WHERE price > 100;"');
    
    connection.release();
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('🚀 You can now test the API with the sample data.');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
