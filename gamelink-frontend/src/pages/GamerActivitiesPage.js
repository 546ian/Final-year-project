import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { postAPI } from '../utils/api';
import './styles/Activities.css';

export default function GamerActivitiesPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await postAPI.getFeed();
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  const handleCreatePost = async () => {
    try {
      await postAPI.create({
        content: newPost,
        post_type: 'general',
        visibility: 'public'
      });
      setNewPost('');
      setShowPostForm(false);
      loadPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  return (
    <div className="activities-page">
      <h1>My Activities</h1>
      
      {!showPostForm ? (
        <button onClick={() => setShowPostForm(true)}>Create Post</button>
      ) : (
        <div className="post-form">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your gaming moment..."
          />
          <button onClick={handleCreatePost}>Post</button>
          <button onClick={() => setShowPostForm(false)}>Cancel</button>
        </div>
      )}

      <div className="activities-log">
        {posts.map(post => (
          <div key={post.id} className="post">
            <h3>{post.username}</h3>
            <p>{post.content}</p>
            <div className="post-actions">
              <button>👍 {post.likes_count}</button>
              <button>💬 {post.comments_count}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
