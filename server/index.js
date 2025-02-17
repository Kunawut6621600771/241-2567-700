const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mysql = require('mysql2/promise');
const port = 8000;

app.use(bodyParser.json()); // ส่งข้อมูลตรง body เป็น json

let users = []

let conn= null

const initMySQL = async () => { 
 conn = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'webdb',
  port: 8830
})
}

app.get('/testdbnew',async (req,res) => {

  try {
   
  const results = await conn.query('SELECT * FROM users')
  res.json(results[0])
}catch(error){
  console.log('error',error.message)
  res.status(500).json({error: 'Error fetching users'})
}
}) 




app.get('/users', async (req, res) => { 
   
    const results = await conn.query('SELECT * FROM users')
    res.json(results[0])
    
  })

app.post('/users', async (req, res) => {
 let user = req.body;
 const results = await conn.query('INSERT INTO users SET ? ', user)
 console.log('results', results)
 res.json({
   message: 'Create user successfully',
   data: results[0]
  })
})

app.get('/users/:id', (req, res) => {
 let id = req.params.id;

 let selectIndex = users.findIndex(user => user.id == id);

 res.json(users[selectIndex]);
})

//put ใช้สำหรับแก้ไขข้อมูล user ตาม id ที่ระบุ  path /user/:id 
app.put('/users/:id', (req, res) => {
  let id = req.params.id;
  let updateUser = req.body;
  let selectIndex = users.findIndex(user => user.id == id); //findIndex คือการหา index ของข้อมูลที่ตรงกับเงื่อนไข
  

      users[selectIndex].firstname = updateUser.firstname ||users[selectIndex].firsttname
      users[selectIndex].lastname = updateUser.lastname|| users[selectIndex].lastname
      users[selectIndex].age = updateUser.age||users[selectIndex].age
      users[selectIndex].gender = updateUser.gender ||users[selectIndex].gender
  
res.json({
    message: 'Update user successfully',
    data:{
      user: updateUser,
      indexUpdate : selectIndex
    }
  })
})

//path:Delete /user/:id ใช้สำหรับลบข้อมูล user ตาม id ที่ระบุ
app.delete('/user/:id', (req, res) => {
  let id = req.params.id;

  //หา index ของ users ที่ต้องการลบ
  let selectIndex = users.findIndex(user => user.id == id); //ค่า selectIndex = ตำแหน่ง index ที่หาเจอ

  //ลบข้อมูลใน users ที่เจอ
  users.splice(selectIndex, 1); //splice คือการลบข้อมูลใน array ตาม index ที่ระบุ
  res.json({
    message: 'Delete user successfully',
    indexDelete: selectIndex
  })
  
})


app.listen(port, async (req, res) => {
  await initMySQL()
  console.log('Http Server is running on port' +port);
});

