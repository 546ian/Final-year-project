import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AvatarPicker.css';

const isImageFile = (file) => file && file.type.startsWith('image/');

const cropAvatarImage = (imageUrl, scale, offsetX, offsetY, canvasSize = 256) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;
      const aspect = naturalWidth / naturalHeight;
      let drawWidth = canvasSize;
      let drawHeight = canvasSize;

      if (aspect > 1) {
        drawHeight = canvasSize;
        drawWidth = canvasSize * aspect;
      } else {
        drawWidth = canvasSize;
        drawHeight = canvasSize / aspect;
      }

      const ratio = canvasSize / 220;
      const dx = (canvasSize - drawWidth) / 2 + offsetX * ratio;
      const dy = (canvasSize - drawHeight) / 2 + offsetY * ratio;

      ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => reject(new Error('Failed to load preview image for cropping'));
    image.src = imageUrl;
  });

const dataUrlToBlob = (dataUrl) => {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
};

export default function AvatarPicker({ avatarUrl, onSave, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(avatarUrl || null);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewOffsetX, setPreviewOffsetX] = useState(0);
  const [previewOffsetY, setPreviewOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const previewCircleRef = useRef(null);
  const backdropRef = useRef();

  useEffect(() => {
    setPreviewUrl(avatarUrl || null);
    setPreviewScale(1);
    setPreviewOffsetX(0);
    setPreviewOffsetY(0);
  }, [avatarUrl]);

  useEffect(() => {
    return () => {
      if (selectedFile && previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [selectedFile, previewUrl]);

  const openModal = () => {
    setShowModal(true);
    setSelectedFile(null);
    setPreviewUrl(avatarUrl || null);
    setPreviewScale(1);
    setPreviewOffsetX(0);
    setPreviewOffsetY(0);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(avatarUrl || null);
      return;
    }

    if (!isImageFile(file)) {
      alert('Please choose an image file for your profile picture.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setPreviewScale(1);
    setPreviewOffsetX(0);
    setPreviewOffsetY(0);
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleDragMove = useCallback((e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setPreviewOffsetX((prev) => prev + deltaX);
    setPreviewOffsetY((prev) => prev + deltaY);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  const handleSave = async () => {
    if (!previewUrl) {
      alert('Please select an image to save.');
      return;
    }

    try {
      const croppedAvatar = await cropAvatarImage(previewUrl, previewScale, previewOffsetX, previewOffsetY);
      const avatarBlob = dataUrlToBlob(croppedAvatar);
      const formData = new FormData();
      formData.append('avatar', avatarBlob, 'avatar.png');
      onSave(formData);
    } catch (error) {
      console.error(error);
      alert('Unable to save the selected image. Please choose a different file.');
      return;
    }

    closeModal();
  };

  const handleDelete = () => {
    onDelete();
    closeModal();
  };

  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  return (
    <>
      <button type="button" className="avatar-picker-button" onClick={openModal}>
        <div className="avatar-picker-circle">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile avatar"
            />
          ) : (
            <span>Upload</span>
          )}
        </div>
      </button>

      {showModal && (
        <div className="avatar-picker-backdrop" onClick={closeModal} ref={backdropRef}>
          <div className="avatar-picker-modal" onClick={stopPropagation}>
            <div className="avatar-picker-header">
              <h2>Edit profile picture</h2>
              <p className="avatar-picker-subtitle">Upload a new image, resize and drag it to position within the circle.</p>
            </div>

            <div className="avatar-picker-preview-row">
              <div
                className="avatar-picker-preview-circle"
                ref={previewCircleRef}
                onMouseDown={handleDragStart}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview avatar"
                    style={{
                      transform: `scale(${previewScale}) translate(${previewOffsetX}px, ${previewOffsetY}px)`,
                      cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                  />
                ) : (
                  <span>No image selected</span>
                )}
              </div>
              <div className="avatar-picker-controls">
                <label className="avatar-picker-file-label">
                  Choose image
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                </label>
                <div className="avatar-picker-zoom-row">
                  <label htmlFor="avatar-zoom">Resize</label>
                  <input
                    id="avatar-zoom"
                    type="range"
                    min="1"
                    max="2"
                    step="0.01"
                    value={previewScale}
                    onChange={(e) => setPreviewScale(Number(e.target.value))}
                  />
                  <span>{Math.round(previewScale * 100)}%</span>
                </div>
                <div className="avatar-picker-actions">
                  <button type="button" className="button-primary" onClick={handleSave}>
                    Save
                  </button>
                  <button type="button" className="button-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
                {avatarUrl && (
                  <button type="button" className="button-danger" onClick={handleDelete}>
                    Delete profile picture
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
