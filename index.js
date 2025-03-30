const baseurl = 'http://localhost:8000';
let mode = 'CREATE';
let selectedId = '';

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        mode = 'EDIT';
        selectedId = id;
        try {
            const response = await axios.get(`${baseurl}/users/${id}`);
            const user = response.data;
            document.querySelector('#id').value = user.id;
            document.querySelector('#firstname').value = user.firstname;
            document.querySelector('#lastname').value = user.lastname;
            document.querySelector('#age').value = user.age;
            document.querySelector('textarea[name=description]').value = user.description;

            document.querySelectorAll('input[name=gender]').forEach(radio => {
                if (radio.value === user.gender) {
                    radio.checked = true;
                }
            });

            document.querySelectorAll('input[name="interests[]"]').forEach(checkbox => {
                if (user.interests.includes(checkbox.value)) {
                    checkbox.checked = true;
                }
            });
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    }
};

const validateData = (userData) => {
    let errors = [];
    if (!userData.firstname.trim()) errors.push('กรุณากรอกชื่อ');
    if (!userData.lastname.trim()) errors.push('กรุณากรอกนามสกุล');
    if (!userData.age.trim()) errors.push('กรุณากรอกอายุ');
    if (!userData.gender) errors.push('กรุณาเลือกเพศ');
    if (!userData.interests || userData.interests.length === 0) errors.push('กรุณาเลือกความสนใจ');
    if (!userData.description.trim()) errors.push('กรุณากรอกคำอธิบาย');
    return errors;
};

const submitData = async (event) => {
    event.preventDefault();
    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = true;

    const userData = {
        id: document.querySelector('#id').value,
        firstname: document.querySelector('#firstname').value,
        lastname: document.querySelector('#lastname').value,
        age: document.querySelector('#age').value,
        gender: document.querySelector('input[name=gender]:checked')?.value || '',
        interests: Array.from(document.querySelectorAll('input[name="interests[]"]:checked')).map(item => item.value),
        description: document.querySelector('textarea[name=description]').value,
    };

    const errors = validateData(userData);
    if (errors.length > 0) {
        showErrorMessage(errors);
        submitButton.disabled = false;
        return;
    }

    const url = mode === 'CREATE' ? `${baseurl}/users` : `${baseurl}/users/${selectedId}`;
    const method = mode === 'CREATE' ? 'POST' : 'PUT';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        document.getElementById('message').innerText = mode === 'CREATE' ? '✅ สร้างผู้ใช้สำเร็จ' : '✅ แก้ไขผู้ใช้สำเร็จ';
        clearForm();
    } catch (error) {
        document.getElementById('message').innerText = '❌ เกิดข้อผิดพลาด: ' + error.message;
    } finally {
        submitButton.disabled = false;
    }
};

const showErrorMessage = (errors) => {
    let messageBox = document.querySelector('.message-box');
    messageBox.innerHTML = `<p>⚠️ กรุณากรอกข้อมูลให้ครบถ้วน</p><ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`;
    messageBox.style.display = 'block';
    setTimeout(() => messageBox.style.display = 'none', 5000);
};

const clearForm = () => {
    document.querySelector('#id').value = '';
    document.querySelector('#firstname').value = '';
    document.querySelector('#lastname').value = '';
    document.querySelector('#age').value = '';
    document.querySelector('textarea[name=description]').value = '';
    document.querySelectorAll('input[name=gender]').forEach(radio => radio.checked = false);
    document.querySelectorAll('input[name="interests[]"]').forEach(checkbox => checkbox.checked = false);
};

document.getElementById('userForm').addEventListener('submit', submitData);