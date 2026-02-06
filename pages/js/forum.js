// Hydrogen Forum 核心功能 JavaScript 文件

// 初始化 localStorage 数据
function initLocalStorage() {
    // 初始化用户数据
    if (!localStorage.getItem('hydrogenUsers')) {
        localStorage.setItem('hydrogenUsers', JSON.stringify([]));
    }
    
    // 初始化帖子数据
    if (!localStorage.getItem('hydrogenPosts')) {
        localStorage.setItem('hydrogenPosts', JSON.stringify([]));
    }
    
    // 初始化评论数据
    if (!localStorage.getItem('hydrogenComments')) {
        localStorage.setItem('hydrogenComments', JSON.stringify([]));
    }
}

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', initLocalStorage);

// ==================== 用户认证功能 ====================

// 检查登录状态并更新导航栏
function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('hydrogenCurrentUser'));
    const loginNav = document.getElementById('loginNav');
    const userNav = document.getElementById('userNav');
    const usernameSpan = document.getElementById('usernameSpan');
    
    if (currentUser) {
        // 用户已登录
        if (loginNav) loginNav.style.display = 'none';
        if (userNav) userNav.style.display = 'block';
        if (usernameSpan) usernameSpan.textContent = currentUser.username;
    } else {
        // 用户未登录
        if (loginNav) loginNav.style.display = 'block';
        if (userNav) userNav.style.display = 'none';
    }
}

// 登出功能
function logout() {
    localStorage.removeItem('hydrogenCurrentUser');
    alert('登出成功！');
    window.location.href = './index.html';
}

// 登录功能
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const users = JSON.parse(localStorage.getItem('hydrogenUsers'));
    
    // 检查用户名是否存在
    const user = users.find(user => user.username === username);
    if (!user) {
        alert('用户名不存在');
        return;
    }
    
    // 检查密码是否正确
    if (user.password !== password) {
        alert('密码错误，请重新输入');
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
        return;
    }
    
    // 登录成功，保存当前用户
    localStorage.setItem('hydrogenCurrentUser', JSON.stringify(user));
    alert('登录成功！');
    window.location.href = './index.html';
}

// 注册功能
function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const users = JSON.parse(localStorage.getItem('hydrogenUsers'));
    
    // 验证密码是否一致
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }
    
    // 检查用户名是否已存在
    if (users.some(user => user.username === username)) {
        alert('用户名已存在，请选择其他用户名');
        document.getElementById('username').value = '';
        document.getElementById('username').focus();
        return;
    }
    
    // 创建新用户
    const newUser = {
        id: Date.now(),
        username: username,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    // 保存新用户
    users.push(newUser);
    localStorage.setItem('hydrogenUsers', JSON.stringify(users));
    
    alert('注册成功！');
    window.location.href = './login.html';
}

// ==================== 帖子管理功能 ====================

// 发布新帖子
function submitPost() {
    // 检查用户是否已登录
    const currentUser = JSON.parse(localStorage.getItem('hydrogenCurrentUser'));
    if (!currentUser) {
        alert('请先登录后再发帖！');
        window.location.href = './login.html';
        return;
    }
    
    const title = document.getElementById('title').value;
    const content = simplemde.value;
    
    if (!title || !content) {
        alert('标题和内容不能为空！');
        return;
    }
    
    const posts = JSON.parse(localStorage.getItem('hydrogenPosts'));
    
    // 创建新帖子
    const newPost = {
        id: Date.now(),
        title: title,
        content: content,
        author: currentUser.username,
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: 0
    };
    
    // 保存新帖子
    posts.unshift(newPost); // 添加到数组开头（最新的帖子显示在前面）
    localStorage.setItem('hydrogenPosts', JSON.stringify(posts));
    
    alert('发帖成功！');
    window.location.href = './所有文章.html';
}

// 获取所有帖子
function getAllPosts() {
    return JSON.parse(localStorage.getItem('hydrogenPosts')) || [];
}

// 根据ID获取帖子
function getPostById(postId) {
    const posts = getAllPosts();
    return posts.find(post => post.id === parseInt(postId));
}

// 显示帖子内容（在查看帖子页面使用）
function displayPost(postId) {
    const post = getPostById(postId);
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
                <span>发布时间: ${formatDate(post.createdAt)}</span>
            </div>
            <div class="post-content">${marked(post.content)}</div>
        </div>
    `;
}

// ==================== 评论管理功能 ====================

// 发布新评论
function submitComment(postId) {
    // 检查用户是否已登录
    const currentUser = JSON.parse(localStorage.getItem('hydrogenCurrentUser'));
    if (!currentUser) {
        alert('请先登录后再评论！');
        window.location.href = './login.html';
        return;
    }
    
    const content = simplemdeComment.value;
    
    if (!content) {
        alert('评论内容不能为空！');
        return;
    }
    
    const comments = JSON.parse(localStorage.getItem('hydrogenComments'));
    
    // 创建新评论
    const newComment = {
        id: Date.now(),
        postId: parseInt(postId),
        content: content,
        author: currentUser.username,
        userId: currentUser.id,
        createdAt: new Date().toISOString()
    };
    
    // 保存新评论
    comments.push(newComment);
    localStorage.setItem('hydrogenComments', JSON.stringify(comments));
    
    // 更新帖子的评论数
    updatePostCommentCount(postId);
    
    // 清空评论框并重新加载评论
    simplemdeComment.value('');
    loadComments(postId);
    
    alert('评论成功！');
}

// 获取指定帖子的所有评论
function getCommentsByPostId(postId) {
    const comments = JSON.parse(localStorage.getItem('hydrogenComments')) || [];
    return comments.filter(comment => comment.postId === parseInt(postId));
}

// 加载并显示评论
function loadComments(postId) {
    const comments = getCommentsByPostId(postId);
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
                    <span>评论时间: ${formatDate(comment.createdAt)}</span>
                </div>
                <div class="comment-content">${marked(comment.content)}</div>
            </div>
        `;
    });
    
    commentsList.innerHTML = commentsHTML;
}

// 更新帖子的评论数
function updatePostCommentCount(postId) {
    const posts = getAllPosts();
    const postIndex = posts.findIndex(post => post.id === parseInt(postId));
    
    if (postIndex !== -1) {
        const comments = getCommentsByPostId(postId);
        posts[postIndex].comments = comments.length;
        localStorage.setItem('hydrogenPosts', JSON.stringify(posts));
    }
}

// ==================== 工具函数 ====================

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
    return !!localStorage.getItem('hydrogenCurrentUser');
}

// 获取当前登录用户
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('hydrogenCurrentUser'));
}