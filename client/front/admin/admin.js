const token = localStorage.getItem('token');
if (!token) window.location.href = '/login.html';

const user = JSON.parse(atob(token.split('.')[1]));
if (user.tipo_user !== 'admin') {
  window.location.href = '/login.html';
}