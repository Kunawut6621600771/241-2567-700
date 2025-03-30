const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 8000;

app.use(bodyParser.json());
app.use(cors());

let conn = null;

const initMySQL = async () => {
    try {
        conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'webdb',
            port: 8830
        });
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
};

const validateData = (userData) => {
    let errors = [];
    if (!userData.firstname) errors.push('กรุณากรอกชื่อ');
    if (!userData.lastname) errors.push('กรุณากรอกนามสกุล');
    if (!userData.age || isNaN(userData.age)) errors.push('อายุต้องเป็นตัวเลข');
    if (!userData.gender) errors.push('กรุณาเลือกเพศ');
    if (!userData.interests || userData.interests.length === 0) errors.push('กรุณาเลือกความสนใจ');
    if (!userData.description) errors.push('กรุณากรอกคำอธิบาย');
    return errors;
};

app.get('/users', async (req, res) => {
    try {
        const [results] = await conn.query('SELECT * FROM users');
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด', errorMessage: error.message });
    }
});

app.post('/users', async (req, res) => {
    try {
        if (!conn) return res.status(500).json({ message: 'Database ยังไม่ได้เชื่อมต่อ' });

        let user = req.body;
        const errors = validateData(user);
        if (errors.length > 0) return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน', errors });

        if (Array.isArray(user.interests)) {
            user.interests = user.interests.join(', ');
        }

        const [results] = await conn.query(
            'INSERT INTO users (id, firstname, lastname, age, gender, description, interests) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [user.id, user.firstname, user.lastname, user.age, user.gender, user.description, user.interests]
        );

        res.status(201).json({ message: 'สร้างผู้ใช้สำเร็จ', userId: results.insertId });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด', errorMessage: error.message });
    }
});

app.get('/users/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID ไม่ถูกต้อง' });

        const [results] = await conn.query('SELECT * FROM users WHERE id = ?', [id]);
        if (results.length === 0) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });

        res.json(results[0]);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด', errorMessage: error.message });
    }
});

app.put('/users/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID ไม่ถูกต้อง' });

        const updateUser = req.body;
        const [results] = await conn.query('UPDATE users SET ? WHERE id = ?', [updateUser, id]);

        if (results.affectedRows === 0) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });

        res.json({ message: 'อัปเดตสำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด', errorMessage: error.message });
    }
});

app.delete('/users/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID ไม่ถูกต้อง' });

        const [results] = await conn.query('DELETE FROM users WHERE id = ?', [id]);
        if (results.affectedRows === 0) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });

        res.json({ message: 'ลบสำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด', errorMessage: error.message });
    }
});

app.listen(port, async () => {
    await initMySQL();
    console.log(' Server is running on port ' + port);
});