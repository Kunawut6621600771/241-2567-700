const baseurl = 'http://localhost:8000';

window.onload = async () => {
    await loadData();
}

const loadData = async () => {
    console.log('load user');
    const response = await axios.get(`${baseurl}/users`);

    console.log(response.data);
    const userDOM = document.getElementById('user');
    let htmldata = '';

    for (let i = 0; i < response.data.length; i++) {
        let user = response.data[i];
        htmldata += `<div>
            <span>${user.id} - ${user.firstname} ${user.lastname}</span>
            <div>
                <a href="index.html?id=${user.id}">Edit</a>
                <button class="delete" data-id="${user.id}">Delete</button>
            </div>
        </div>`;
    }
    userDOM.innerHTML = htmldata;

    const deleteDOMs = document.getElementsByClassName('delete');
    for (let i = 0; i < deleteDOMs.length; i++) {
        deleteDOMs[i].addEventListener('click', async (event) => {
            const id = event.target.getAttribute('data-id');
            try {
                await axios.delete(`${baseurl}/users/${id}`);
                loadData();
            } catch (error) {
                console.error('error:', error);
            }
        });
    }
}