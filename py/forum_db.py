import sqlite3

def init_db():
    # 连接数据库（如果不存在则自动创建）
    conn = sqlite3.connect('forum_data.db')
    cursor = conn.cursor()
    
    # 创建users表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # 创建posts表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        author TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        comment_count INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # 创建comments表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # 创建announcements表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()

# 初始化数据库
init_db()

# 用户相关操作
def register_user(username, password):
    conn = sqlite3.connect('forum_data.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        INSERT INTO users (username, password) 
        VALUES (?, ?)
        ''', (username, password))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def login_user(username, password):
    conn = sqlite3.connect('forum_data.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM users 
    WHERE username = ? AND password = ?
    ''', (username, password))
    
    user = cursor.fetchone()
    conn.close()
    return user

# 帖子相关操作
def create_post(title, content, user_id, author):
    conn = sqlite3.connect('forum_data.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO posts (title, content, user_id, author) 
    VALUES (?, ?, ?, ?)
    ''', (title, content, user_id, author))
    
    post_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return post_id

def get_all_posts():
    conn = sqlite3.connect('forum_data.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM posts ORDER BY created_at DESC
    ''')
    
    posts = cursor.fetchall()
    conn.close()
    return posts

def get_post_by_id(post_id):
    conn = sqlite3.connect('forum_data.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM posts WHERE id = ?
    ''', (post_id,))
    
    post = cursor.fetchone()
    conn.close()
    return post

def update_post_comment_count(post_id):
    conn = sqlite3.connect('forum_data.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    UPDATE posts SET comment_count = (
        SELECT COUNT(*) FROM comments WHERE post_id = ?
    ) WHERE id = ?
    ''', (post_id, post_id))
    
    conn.commit()
    conn.close()

# 评论相关操作
def create_comment(post_id, user_id, author, content):
    conn = sqlite3.connect('forum_data.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO comments (post_id, user_id, author, content) 
    VALUES (?, ?, ?, ?)
    ''', (post_id, user_id, author, content))
    
    conn.commit()
    conn.close()
    update_post_comment_count(post_id)

def get_comments_by_post_id(post_id):
    conn = sqlite3.connect('forum_data.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC
    ''', (post_id,))
    
    comments = cursor.fetchall()
    conn.close()
    return comments

# 公告相关操作
def create_announcement(title, content):
    conn = sqlite3.connect('forum_data.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO announcements (title, content) 
    VALUES (?, ?)
    ''', (title, content))
    
    conn.commit()
    conn.close()

def get_all_announcements():
    conn = sqlite3.connect('forum_data.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM announcements ORDER BY created_at DESC
    ''')
    
    announcements = cursor.fetchall()
    conn.close()
    return announcements

def get_announcement_by_id(announcement_id):
    conn = sqlite3.connect('forum_data.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM announcements WHERE id = ?
    ''', (announcement_id,))
    
    announcement = cursor.fetchone()
    conn.close()
    return announcement