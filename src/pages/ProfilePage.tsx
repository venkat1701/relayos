/**
 * Dark Theme Profile Page - User Account Management
 */

interface ProfilePageProps {
  user: {
    full_name: string;
    email: string;
  } | null;
}

export function ProfilePage({ user }: ProfilePageProps) {
  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile</h1>
        <p className="subtitle">Manage your account settings</p>
      </div>

      <div className="profile-grid">
        <div className="profile-section">
          <div className="avatar-section">
            <div className="avatar-large">
              {user?.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <button className="change-avatar-btn">Change Photo</button>
          </div>

          <div className="info-section">
            <h2 className="section-title">Personal Information</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" defaultValue={user?.full_name || ""} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" defaultValue={user?.email || ""} disabled />
              <p className="input-hint">Email cannot be changed</p>
            </div>
            <button className="save-btn">Save Changes</button>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Change Password</h2>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" placeholder="Enter current password" />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" placeholder="Enter new password" />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" placeholder="Confirm new password" />
          </div>
          <button className="save-btn">Update Password</button>
        </div>

        <div className="profile-section danger-zone">
          <h2 className="section-title">Danger Zone</h2>
          <div className="danger-item">
            <div>
              <h3>Delete Account</h3>
              <p>Permanently delete your account and all data</p>
            </div>
            <button className="danger-btn">Delete Account</button>
          </div>
        </div>
      </div>

      <style>{`
        .profile-page {
          max-width: 800px;
          margin: 0 auto;
        }

        .profile-header {
          margin-bottom: 32px;
        }

        .profile-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #ECE4B7;
          margin: 0 0 4px;
        }

        .subtitle {
          font-size: 14px;
          color: rgba(236, 228, 183, 0.5);
          margin: 0;
        }

        .profile-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .profile-section {
          background: #0a0a0a;
          border-radius: 12px;
          border: 1px solid #1a1a1a;
          padding: 32px;
        }

        .avatar-section {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 32px;
          border-bottom: 1px solid #1a1a1a;
        }

        .avatar-large {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          color: #020202;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 48px;
          margin: 0 auto 20px;
        }

        .change-avatar-btn {
          padding: 10px 24px;
          background: #141414;
          border: 1px solid #1a1a1a;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          color: rgba(236, 228, 183, 0.8);
          cursor: pointer;
          transition: all 0.2s;
        }

        .change-avatar-btn:hover {
          background: #1a1a1a;
          border-color: #2a2a2a;
          color: #ECE4B7;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #ECE4B7;
          margin: 0 0 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          font-size: 14px;
          color: rgba(236, 228, 183, 0.8);
          margin-bottom: 8px;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #1a1a1a;
          border-radius: 8px;
          font-size: 14px;
          color: #ECE4B7;
          background: #141414;
          outline: none;
          transition: all 0.2s;
        }

        .form-group input:focus {
          border-color: #00A7E1;
          box-shadow: 0 0 0 3px rgba(0, 167, 225, 0.1);
        }

        .form-group input:disabled {
          background: #0a0a0a;
          cursor: not-allowed;
          color: rgba(236, 228, 183, 0.4);
        }

        .form-group input::placeholder {
          color: rgba(236, 228, 183, 0.3);
        }

        .input-hint {
          font-size: 13px;
          color: rgba(236, 228, 183, 0.4);
          margin: 6px 0 0;
        }

        .save-btn {
          padding: 12px 32px;
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          color: #020202;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 167, 225, 0.3);
        }

        .danger-zone {
          border-color: rgba(204, 41, 54, 0.3);
        }

        .danger-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .danger-item h3 {
          font-size: 15px;
          font-weight: 600;
          color: #ECE4B7;
          margin: 0 0 4px;
        }

        .danger-item p {
          font-size: 13px;
          color: rgba(236, 228, 183, 0.5);
          margin: 0;
        }

        .danger-btn {
          padding: 10px 24px;
          background: rgba(204, 41, 54, 0.2);
          color: #CC2936;
          border: 1px solid #CC2936;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .danger-btn:hover {
          background: rgba(204, 41, 54, 0.3);
        }
      `}</style>
    </div>
  );
}
