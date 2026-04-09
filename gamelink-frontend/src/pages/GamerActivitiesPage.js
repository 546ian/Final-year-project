import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { postAPI } from '../utils/api';
import logo from '../Assets/logo.png';
import './styles/Activities.css';

export default function GamerActivitiesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [activePostMenu, setActivePostMenu] = useState(null);
  const [commentEditor, setCommentEditor] = useState({ postId: null, commentId: null, content: '' });

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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMediaPreview(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setMediaPreview(null);
    }
  };

  const handleCreatePost = async () => {
    try {
      let mediaUrls = [];
      if (selectedFile) {
        const formData = new FormData();
        formData.append('media', selectedFile);
        const uploadRes = await postAPI.uploadMedia(formData);
        mediaUrls = [uploadRes.data.mediaUrl];
      }

      await postAPI.create({
        content: newPost,
        media_urls: mediaUrls,
        post_type: 'general',
        visibility: 'public'
      });
      setNewPost('');
      setSelectedFile(null);
      setMediaPreview(null);
      setShowPostForm(false);
      loadPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const parseMediaUrls = (post) => {
    if (!post.media_urls) return [];
    if (Array.isArray(post.media_urls)) return post.media_urls;
    try {
      return JSON.parse(post.media_urls);
    } catch {
      return [];
    }
  };

  const handleTogglePostMenu = (postId) => {
    setActivePostMenu(activePostMenu === postId ? null : postId);
  };

  const handleDeletePost = async (postId) => {
    const confirmed = window.confirm('Delete this post? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await postAPI.deletePost(postId);
      setActivePostMenu(null);
      loadPosts();
      alert('Post deleted successfully.');
    } catch (error) {
      console.error('Failed to delete post:', error);
      const message = error?.response?.data?.error || 'Failed to delete post';
      alert(message);
    }
  };

  const handleEditComment = async (post) => {
    setActivePostMenu(null);

    try {
      const response = await postAPI.getComments(post.id);
      const ownComment = response.data.find((comment) => comment.user_id === user?.id);
      if (!ownComment) {
        alert('You do not have a comment on this post to edit.');
        return;
      }
      setCommentEditor({
        postId: post.id,
        commentId: ownComment.id,
        content: ownComment.content || ''
      });
    } catch (error) {
      console.error('Failed to load comments:', error);
      alert('Unable to load comments for editing.');
    }
  };

  const handleSaveCommentEdit = async () => {
    if (!commentEditor.content.trim()) {
      alert('Comment cannot be empty.');
      return;
    }

    try {
      await postAPI.editComment(commentEditor.postId, commentEditor.commentId, commentEditor.content);
      setCommentEditor({ postId: null, commentId: null, content: '' });
      alert('Comment updated successfully.');
    } catch (error) {
      console.error('Failed to update comment:', error);
      const message = error?.response?.data?.error || 'Failed to update comment';
      alert(message);
    }
  };

  return (
    <div className="activities-page">
      <div className="topbar">
        <div className="topbar-left">
          <div className="avatar-circle" />
          <div className="welcome-block">
            <p className="welcome-label">Welcome</p>
            <p className="welcome-name">
              {user?.username || user?.email?.split('@')[0] || 'Gamer'}
            </p>
          </div>
        </div>

        <div className="topbar-center">
          <button className="top-tab" onClick={() => navigate('/profile')}>
            Profile
          </button>
          <button className="top-tab" onClick={() => navigate('/gamer-home')}>
            Home
          </button>
          <button className="top-tab active" onClick={() => navigate('/activities')}>
            Activities
          </button>
        </div>

        <div className="topbar-right">
          <Link to="/gamer-home">
            <img src={logo} alt="Gamelink logo" />
          </Link>
        </div>
      </div>

      <div className="page-title-row">
        <h1>ACTIVITIES</h1>
        <div className="title-line" />
      </div>

      <div className="activities-grid">
        <div className="activities-card left-card">
          <div className="card-header">
            <span>Posts</span>
            <button
            className="icon-button"
            type="button"
            onClick={() => {
              setShowPostForm(true);
              setSelectedFile(null);
              setMediaPreview(null);
            }}
          >
              +
            </button>
          </div>

          <div className="upload-card">
            <label className="file-input-label">
              <span>Upload media</span>
              <input type="file" accept="image/*,video/*" onChange={handleFileChange} disabled={!showPostForm} />
            </label>
            {mediaPreview && (
              <div className="media-preview">
                <img src={mediaPreview} alt="Preview" />
                <p>{selectedFile?.name}</p>
              </div>
            )}
            {showPostForm ? (
              <>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Comment"
                />
                <div className="buttons-row">
                  <button className="activity-button primary" type="button" onClick={handleCreatePost}>
                    Upload
                  </button>
                  <button className="activity-button secondary" type="button" onClick={() => {
                    setShowPostForm(false);
                    setSelectedFile(null);
                    setMediaPreview(null);
                  }}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="upload-hint">Click the + icon to start uploading</div>
            )}
          </div>

          <div className="posts-list">
            {posts.length > 0 ? (
              posts.map((post) => {
                const mediaUrls = parseMediaUrls(post);
                return (
                  <div key={post.id} className="post-card" onMouseLeave={() => activePostMenu === post.id && setActivePostMenu(null)}>
                    <div className="post-card-header">
                      <h3>{post.username}</h3>
                      <div className="post-card-actions">
                        <button
                          type="button"
                          className="post-options-button"
                          onClick={() => handleTogglePostMenu(post.id)}
                        >
                          ⋮
                        </button>
                        {activePostMenu === post.id && (
                          <div className="post-options-menu">
                            {post.user_id === user?.id && (
                              <button type="button" onClick={() => handleDeletePost(post.id)}>
                                Delete post
                              </button>
                            )}
                            <button type="button" onClick={() => handleEditComment(post)}>
                              Edit comment
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p>{post.content}</p>
                    {mediaUrls.length > 0 && (
                      <div className="post-media-grid">
                        {mediaUrls.map((url) => (
                          <img key={url} src={url} alt="Post media" className="post-media" />
                        ))}
                      </div>
                    )}
                    <div className="post-actions">
                      <button type="button">👍 {post.likes_count}</button>
                      <button type="button">💬 {post.comments_count}</button>
                    </div>
                    {commentEditor.postId === post.id && (
                      <div className="comment-edit-panel">
                        <textarea
                          value={commentEditor.content}
                          onChange={(e) => setCommentEditor({ ...commentEditor, content: e.target.value })}
                          placeholder="Edit your comment"
                        />
                        <div className="comment-edit-actions">
                          <button className="activity-button primary" type="button" onClick={handleSaveCommentEdit}>
                            Save comment
                          </button>
                          <button
                            className="activity-button secondary"
                            type="button"
                            onClick={() => setCommentEditor({ postId: null, commentId: null, content: '' })}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="empty-state">No recent posts yet</div>
            )}
          </div>
        </div>

        <div className="activities-card right-card">
          <div className="card-header">
            <span>Activity Stats</span>
          </div>
          <div className="stats-list">
            {[
              'Account active duration:',
              'Total Take Ons:',
              'Greatest Rival:',
              'Take Ons won:',
              'Take Ons lost:',
              'Tournaments won:',
              'Tournaments lost:',
              'Tournaments hosted:',
              'Account status type:',
              'eSports teams signed into:',
              'Duration as signed gamer:',
              'Duration as free agent:'
            ].map((line) => (
              <div key={line} className="stats-item">
                <p>{line}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
