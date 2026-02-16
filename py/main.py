from flask import Flask, request, jsonify, session, redirect, url_for
from forum_db import (
    init_db, register_user, login_user, create_post, get_all_posts,
    get_post_by_id, create_comment, get_comments_by_post_id,
    create_announcement, get_all_announcements, get_announcement_by_id
)
import sqlite3
import os

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # 用于session加密

# 确保静态文件目录存在
if not os.path.exists('static'):
    os.makedirs('static')
if not os.path.exists('static/pages'):
    os.makedirs('static/pages')
if not os.path.exists('static/pages/js'):
    os.makedirs('static/pages/js')
if not os.path.exists('static/pages/css'):
    os.makedirs('static/pages/css')

# 初始化数据库
init_db()

# 允许跨域请求
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# 用户注册
@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'message': '用户名和密码不能为空'})
    
    if register_user(username, password):
        return jsonify({'success': True, 'message': '注册成功'})
    else:
        return jsonify({'success': False, 'message': '用户名已存在'})

# 用户登录
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = login_user(username, password)
    if user:
        session['user_id'] = user[0]
        session['username'] = user[1]
        return jsonify({'success': True, 'message': '登录成功', 'user': {'id': user[0], 'username': user[1]}})
    else:
        return jsonify({'success': False, 'message': '用户名或密码错误'})

# 用户登出
@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True, 'message': '登出成功'})

# 获取当前用户
@app.route('/api/current-user', methods=['GET'])
def api_current_user():
    if 'user_id' in session:
        return jsonify({'success': True, 'user': {'id': session['user_id'], 'username': session['username']}})
    else:
        return jsonify({'success': False, 'message': '未登录'})

# 帖子相关API
@app.route('/api/posts', methods=['GET', 'POST'])
def api_posts():
    if request.method == 'GET':
        posts = get_all_posts()
        posts_list = []
        for post in posts:
            posts_list.append({
                'id': post[0],
                'title': post[1],
                'content': post[2],
                'user_id': post[3],
                'author': post[4],
                'created_at': post[5],
                'updated_at': post[6],
                'comment_count': post[7]
            })
        return jsonify({'success': True, 'posts': posts_list})
    
    elif request.method == 'POST':
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': '请先登录'})
        
        data = request.json
        title = data.get('title')
        content = data.get('content')
        
        if not title or not content:
            return jsonify({'success': False, 'message': '标题和内容不能为空'})
        
        post_id = create_post(title, content, session['user_id'], session['username'])
        return jsonify({'success': True, 'message': '发帖成功', 'post_id': post_id})

@app.route('/api/posts/<int:post_id>', methods=['GET'])
def api_post(post_id):
    post = get_post_by_id(post_id)
    if post:
        post_data = {
            'id': post[0],
            'title': post[1],
            'content': post[2],
            'user_id': post[3],
            'author': post[4],
            'created_at': post[5],
            'updated_at': post[6],
            'comment_count': post[7]
        }
        return jsonify({'success': True, 'post': post_data})
    else:
        return jsonify({'success': False, 'message': '帖子不存在'})

# 评论相关API
@app.route('/api/comments', methods=['POST'])
def api_comments():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': '请先登录'})
    
    data = request.json
    post_id = data.get('post_id')
    content = data.get('content')
    
    if not post_id or not content:
        return jsonify({'success': False, 'message': '帖子ID和评论内容不能为空'})
    
    create_comment(post_id, session['user_id'], session['username'], content)
    return jsonify({'success': True, 'message': '评论成功'})

@app.route('/api/posts/<int:post_id>/comments', methods=['GET'])
def api_post_comments(post_id):
    comments = get_comments_by_post_id(post_id)
    comments_list = []
    for comment in comments:
        comments_list.append({
            'id': comment[0],
            'post_id': comment[1],
            'user_id': comment[2],
            'author': comment[3],
            'content': comment[4],
            'created_at': comment[5]
        })
    return jsonify({'success': True, 'comments': comments_list})

# 公告相关API
@app.route('/api/announcements', methods=['GET', 'POST'])
def api_announcements():
    if request.method == 'GET':
        announcements = get_all_announcements()
        announcements_list = []
        for announcement in announcements:
            announcements_list.append({
                'id': announcement[0],
                'title': announcement[1],
                'content': announcement[2],
                'created_at': announcement[3],
                'updated_at': announcement[4]
            })
        return jsonify({'success': True, 'announcements': announcements_list})
    
    elif request.method == 'POST':
        # 这里可以添加管理员权限检查
        data = request.json
        title = data.get('title')
        content = data.get('content')
        
        if not title or not content:
            return jsonify({'success': False, 'message': '标题和内容不能为空'})
        
        create_announcement(title, content)
        return jsonify({'success': True, 'message': '公告发布成功'})

@app.route('/api/announcements/<int:announcement_id>', methods=['GET'])
def api_announcement(announcement_id):
    announcement = get_announcement_by_id(announcement_id)
    if announcement:
        announcement_data = {
            'id': announcement[0],
            'title': announcement[1],
            'content': announcement[2],
            'created_at': announcement[3],
            'updated_at': announcement[4]
        }
        return jsonify({'success': True, 'announcement': announcement_data})
    else:
        return jsonify({'success': False, 'message': '公告不存在'})

# 静态文件服务
@app.route('/pages/<path:path>')
def serve_pages(path):
    return app.send_static_file('pages/' + path)

# 根路径重定向到首页
@app.route('/')
def index():
    return redirect('/pages/index.html')

if __name__ == '__main__':
    # 复制静态文件到static目录
    import shutil
    import glob
    
    # 复制所有html文件
    for file in glob.glob('../pages/*.html'):
        shutil.copy(file, 'static/pages/')
    
    # 复制js文件
    if os.path.exists('../pages/js'):
        for file in glob.glob('../pages/js/*.js'):
            shutil.copy(file, 'static/pages/js/')
    
    # 复制css文件
    if os.path.exists('../pages/css'):
        for file in glob.glob('../pages/css/*.css'):
            shutil.copy(file, 'static/pages/css/')
    
    # 复制根目录css文件
    if os.path.exists('../css'):
        for file in glob.glob('../css/*.css'):
            shutil.copy(file, 'static/pages/')
    
    app.run(host='0.0.0.0', port=5000, debug=True)