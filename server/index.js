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
    conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'webdb',
        port: 8830
    });
};

const validateData = (userData) => {
    let errors = [];

    if (!userData.firstname) {
        errors.push('กรุณากรอกชื่อ');
    } else if (userData.firstname.length > 255) {
        errors.push('ชื่อต้องไม่เกิน 255 ตัวอักษร');
    }
    if (!userData.lastname) {
        errors.push('กรุณากรอกนามสกุล');
    } else if (userData.lastname.length > 255) {
        errors.push('นามสกุลต้องไม่เกิน 255 ตัวอักษร');
    }
    if (!userData.age) {
        errors.push('กรุณากรอกอายุ');
    } else if (isNaN(userData.age)) {
        errors.push('อายุต้องเป็นตัวเลข');
    }
    if (!userData.gender) {
        errors.push('กรุณาเลือกเพศ');
    }
    if (!userData.interests || (Array.isArray(userData.interests) && userData.interests.length === 0) || (typeof userData.interests === 'string' && userData.interests.trim() === '')) {
        errors.push('กรุณาเลือกความสนใจ');
    }
    if (!userData.description) {
        errors.push('กรุณากรอกคำอธิบาย');
    }
    return errors;
};

// path = GET /users สำหรับ get users ทั้งหมดที่บันทึกไว้
app.get('/users', async (req, res) => {
    try {
        const [results] = await conn.query('SELECT * FROM users');
        res.json(results);
    } catch (error) {
        console.error('error: ', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้', errorMessage: error.message });
    }
});

// path = POST /users สำหรับสร้าง users ใหม่บันทึกเข้าไป
app.post('/users', async (req, res) => {
    try {
        let user = req.body;
        const errors = validateData(user);
        if (errors.length > 0) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน', errors: errors });
        }
        const [results] = await conn.query('INSERT INTO users SET ?', user);
        res.json({ message: 'สร้างผู้ใช้สำเร็จ', data: results });
    } catch (error) {
        console.error('error message: ', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ใช้', errorMessage: error.message });
    }
});

// path = GET /users/:id สำหรับดึง users รายคนออกมา
app.get('/users/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID ไม่ถูกต้อง' });
        }
        const [results] = await conn.query('SELECT * FROM users WHERE id = ?', id);
        if (results.length === 0) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        }
        res.json(results[0]);
    } catch (error) {
        console.error('error: ', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้', errorMessage: error.message });
    }
});

// path: PUT /users/:id สำหรับแก้ไข users รายคน (ตาม id ที่บันทึกเข้าไป)
app.put('/users/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID ไม่ถูกต้อง' });
        }
        const updateUser = req.body;
        const [results] = await conn.query('UPDATE users SET ? WHERE id = ?', [updateUser, id]);
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        }
        res.json({ message: 'แก้ไขข้อมูลผู้ใช้สำเร็จ', data: results });
    } catch (error) {
        console.error('error: ', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้', errorMessage: error.message });
    }
});

// path: DELETE /users/:id สำหรับลบ users รายคน (ตาม id ที่บันทึกเข้าไป)
app.delete('/users/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID ไม่ถูกต้อง' });
        }
        const [results] = await conn.query('DELETE FROM users WHERE id = ?', id);
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        }
        res.json({ message: 'ลบข้อมูลผู้ใช้สำเร็จ', data: results });
    } catch (error) {
        console.error('error: ', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูลผู้ใช้', errorMessage: error.message });
    }
});

app.listen(port, async () => {
    await initMySQL();
    console.log('Http Server is running on port ' + port);
});