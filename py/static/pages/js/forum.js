// Hydrogen Forum 核心功能 JavaScript 文件

// API基础URL
const API_BASE_URL = 'http://localhost:5000/api';

// 页面加载时检查登录状态
window.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
});

// 检查登录状态并更新导航栏
function checkLoginStatus() {
    fetch(`${API_BASE_URL}/current-user`)
        .then(response => response.json())
        .then(data => {
            const currentUser = data.user;
            const loginNav = document.getElementById('loginNav');
            const userNav = document.getElementById('userNav');
            const usernameSpan = document.getElementById('usernameSpan');
            
            if (data.success && currentUser) {
                // 用户已登录
                if (loginNav) loginNav.style.display = 'none';
                if (userNav) userNav.style.display = 'block';
                if (usernameSpan) usernameSpan.textContent = currentUser.username;
            } else {
                // 用户未登录
                if (loginNav) loginNav.style.display = 'block';
                if (userNav) userNav.style.display = 'none';
            }
        });
}

// 登出功能
function logout() {
    fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('登出成功！');
            window.location.href = './index.html';
        }
    });
}

// 登录功能
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('登录成功！');
            window.location.href = './index.html';
        } else {
            alert(data.message);
        }
    });
}

// 注册功能
function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }
    
    fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('注册成功！');
            window.location.href = './login.html';
        } else {
            alert(data.message);
        }
    });
}

// 发布新帖子
function submitPost() {
    const title = document.getElementById('title').value;
    const content = simplemde.value;
    
    if (!title || !content) {
        alert('标题和内容不能为空！');
        return;
    }
    
    fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('发帖成功！');
            window.location.href = './所有文章.html';
        } else {
            alert(data.message);
            if (data.message === '请先登录') {
                window.location.href = './login.html';
            }
        }
    });
}

// 获取所有帖子
function getAllPosts() {
    return fetch(`${API_BASE_URL}/posts`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                return data.posts;
            } else {
                return [];
            }
        });
}

// 根据ID获取帖子
function getPostById(postId) {
    return fetch(`${API_BASE_URL}/posts/${postId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                return data.post;
            } else {
                return null;
            }
        });
}

// 显示帖子内容
function displayPost(postId) {
    getPostById(postId)
        .then(post => {
            if (!post) {
                document.getElementById('postContent').innerHTML = '<p>帖子不存在或已被删除</p>';
                return;
            }
            
            // 渲染帖子内容
            const postContent = document.getElementById('postContent');
            postContent.innerHTML = `
                <div class="post">
                    <h2>${post.title}</h2>
                    <div class="post-meta">
                        <span>作者: ${post.author}</span>
                        <span>发布时间: ${formatDate(post.created_at)}</span>
                    </div>
                    <div class="post-content">${marked(post.content)}</div>
                </div>
            `;
            
            // 加载评论
            loadComments(postId);
        });
}

// 发布新评论
function submitComment(postId) {
    const content = simplemdeComment.value;
    
    if (!content) {
        alert('评论内容不能为空！');
        return;
    }
    
    fetch(`${API_BASE_URL}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ post_id: postId, content })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 清空评论框并重新加载评论
            simplemdeComment.value('');
            loadComments(postId);
            alert('评论成功！');
        } else {
            alert(data.message);
            if (data.message === '请先登录') {
                window.location.href = './login.html';
            }
        }
    });
}

// 加载并显示评论
function loadComments(postId) {
    fetch(`${API_BASE_URL}/posts/${postId}/comments`)
        .then(response => response.json())
        .then(data => {
            const comments = data.comments || [];
            const commentsList = document.getElementById('commentsList');
            
            if (!commentsList) return;
            
            if (comments.length === 0) {
                commentsList.innerHTML = '<p>暂无评论，快来发表第一条评论吧！</p>';
                return;
            }
            
            // 渲染评论列表
            let commentsHTML = '';
            comments.forEach(comment => {
                commentsHTML += `
                    <div class="comment">
                        <div class="comment-meta">
                            <span>评论者: ${comment.author}</span>
                            <span>评论时间: ${formatDate(comment.created_at)}</span>
                        </div>
                        <div class="comment-content">${marked(comment.content)}</div>
                    </div>
                `;
            });
            
            commentsList.innerHTML = commentsHTML;
        });
}

// 获取所有公告
function getAllAnnouncements() {
    return fetch(`${API_BASE_URL}/announcements`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                return data.announcements;
            } else {
                return [];
            }
        });
}

// 发布新公告
function submitAnnouncement() {
    const title = document.getElementById('title').value;
    const content = simplemde.value;
    
    if (!title || !content) {
        alert('标题和内容不能为空！');
        return;
    }
    
    fetch(`${API_BASE_URL}/announcements`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('公告发布成功！');
            window.location.href = './announcement.html';
        } else {
            alert(data.message);
        }
    });
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 检查用户是否已登录
function isUserLoggedIn() {
    return fetch(`${API_BASE_URL}/current-user`)
        .then(response => response.json())
        .then(data => data.success);
}

// 获取当前登录用户
function getCurrentUser() {
    return fetch(`${API_BASE_URL}/current-user`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                return data.user;
            } else {
                return null;
            }
        });
}