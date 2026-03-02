// // frontend/src/pages/ProfilePage.jsx
// frontend/src/pages/ProfilePage.jsx
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import DarkModeToggle from "../components/DarkModeToggle";
import API from "../utils/api";
import "../styles/global.css";
import { getImageURL } from "../utils/imageHelper";

export default function ProfilePage() {
  const { user, logout, refreshUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState("profile"); // profile, transactions
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [referralCode, setReferralCode] = useState(user?.referralCode || null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const navigate = useNavigate();

  // Generate referral code if not already present
  useEffect(() => {
    if (!user) return;
    
    if (!user.referralCode && !referralCode && !generatingCode) {
      // Only generate once
      generateReferralCode();
    } else if (user.referralCode) {
      setReferralCode(user.referralCode);
    }
  }, [user?._id, user?.referralCode]);

  const generateReferralCode = async () => {
    setGeneratingCode(true);
    try {
      const response = await API.post("/user/referral-code");
      if (response.data.referralCode) {
        setReferralCode(response.data.referralCode);
        // Refresh user data to sync the context
        if (refreshUser) {
          await refreshUser();
        }
      }
    } catch (error) {
      console.error("Failed to generate referral code:", error);
    } finally {
      setGeneratingCode(false);
    }
  };

  // Load payment transactions
  useEffect(() => {
    if (activeTab === "transactions" && payments.length === 0) {
      loadPayments();
    }
  }, [activeTab]);

  const loadPayments = async () => {
    setTransactionsLoading(true);
    try {
      const response = await API.get("/payments/user-payments");
      setPayments(response.data || []);
    } catch (error) {
      console.error("Failed to load payments:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const avatarURL = user?.profileImage && !imgError ? getImageURL(user.profileImage) : null;
  const placeholderURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.fullName || user?.username || "User"
  )}&background=b30000&color=fff`;

  return (
    <>
      <header className="header">
        <div className="logo">
          <img src="/imgs/logo-DME2.png" alt="Logo" />
        </div>
        <DarkModeToggle />
        <h2>PROFILE</h2>
      </header>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div
              className="profile-avatar"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                overflow: "hidden",
                position: "relative",
                backgroundColor: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {avatarURL ? (
                <img
                  src={avatarURL}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <img
                  src={placeholderURL}
                  alt="Placeholder"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>

            <div className="profile-info">
              <h2>{user?.fullName || "User"}</h2>
              <p>@{user?.username || "No username"}</p>
              <span className="verified-badge">
                {user?.isVerified ? "✓ Verified" : "⚠ Not Verified"}
              </span>
            </div>
          </div>

          <div className="profile-stats">
            {/* <div className="stat-item">
              <h3>Posts</h3>
              <p>{user?.stats?.posts || user?.blogCount || 0}</p>
            </div>
            <div className="stat-item">
              <h3>Quizzes</h3>
              <p>{user?.stats?.quizzes || user?.quizHistory?.length || 0}</p>
            </div> */}
            <div className="stat-item">
              <h3>Joined</h3>
              <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}</p>
            </div>
          </div>

          {/* Referral & access summary */}
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              borderRadius: "12px",
              background: "#f8f9fa",
              border: "1px solid #e0e0e0"
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Referral Program</h3>
            
            {/* Referral Code Box */}
            <div style={{
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #ddd",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              justifyContent: "space-between"
            }}>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#666" }}>Your Referral Code</p>
                <p style={{ margin: 0, fontSize: "18px", fontWeight: "bold", fontFamily: "monospace" }}>
                  {generatingCode ? "Generating..." : (referralCode || "Not generated yet")}
                </p>
              </div>
              {referralCode && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(referralCode);
                    alert("Referral code copied!");
                  }}
                  style={{
                    padding: "8px 12px",
                    background: "var(--color-primary)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                >
                  Copy
                </button>
              )}
              {!referralCode && !generatingCode && (
                <button
                  onClick={generateReferralCode}
                  style={{
                    padding: "8px 12px",
                    background: "var(--color-primary)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                >
                  Generate
                </button>
              )}
            </div>

            {/* Referral Stats */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "12px",
              marginBottom: "16px"
            }}>
              <div style={{
                padding: "12px",
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #ddd",
                textAlign: "center"
              }}>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#666" }}>Total Referrals</p>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "var(--color-primary)" }}>
                  {user?.referralStats?.totalReferrals || 0}
                </p>
              </div>
              <div style={{
                padding: "12px",
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #ddd",
                textAlign: "center"
              }}>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#666" }}>Successful Referrals</p>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "var(--color-primary)" }}>
                  {user?.successfulReferrals || 0}
                </p>
              </div>
              <div style={{
                padding: "12px",
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #ddd",
                textAlign: "center"
              }}>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#666" }}>Free Quiz Credits</p>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "var(--color-primary)" }}>
                  {user?.freeQuizCredits || 0}
                </p>
              </div>
            </div>

            {/* Reward Rule */}
            <div style={{
              padding: "12px",
              backgroundColor: "#fff9e6",
              borderLeft: "4px solid var(--color-primary)",
              borderRadius: "4px",
              marginBottom: "12px"
            }}>
              <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.6" }}>
                <strong>Reward Rule:</strong> Every 3 successful referrals = 1 free quiz entry
              </p>
            </div>

            {/* Share Prompt */}
            <div style={{
              padding: "12px",
              backgroundColor: "rgba(179, 0, 0, 0.05)",
              borderRadius: "8px",
              border: "1px dashed rgba(179, 0, 0, 0.2)"
            }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "bold" }}>
                📢 Share Your Code
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#666", lineHeight: "1.5" }}>
                Share your referral code with friends and family. When they sign up using your code and complete their first successful quiz payment, you'll earn a successful referral!
              </p>
            </div>

            {/* PDF Access Status */}
            <p style={{ margin: "16px 0 0 0", fontSize: "12px", color: "#666" }}>
              <strong>PDF Access:</strong>{" "}
              {user?.hasPdfAccess
                ? "✓ Lifetime unlocked"
                : "Locked until a quiz payment is made"}
            </p>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
            <button
              onClick={() => setActiveTab("profile")}
              style={{
                padding: '10px 20px',
                background: activeTab === 'profile' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'profile' ? 'white' : '#666',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                borderBottom: activeTab === 'profile' ? '3px solid var(--color-primary)' : 'none',
                fontWeight: activeTab === 'profile' ? 'bold' : 'normal'
              }}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              style={{
                padding: '10px 20px',
                background: activeTab === 'transactions' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'transactions' ? 'white' : '#666',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                borderBottom: activeTab === 'transactions' ? '3px solid var(--color-primary)' : 'none',
                fontWeight: activeTab === 'transactions' ? 'bold' : 'normal'
              }}
            >
              Transactions
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-actions">
              <button className="action-button primary" onClick={() => navigate("/edit-profile")}>
                Edit Profile
              </button>
              <button className="action-button secondary">Change Password</button>
              <button className="action-button danger" onClick={handleLogout} disabled={loading}>
                {loading ? "⌛️Logging out..." : "Logout"}
              </button>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '15px' }}>Payment History</h3>
              {transactionsLoading ? (
                <p style={{ textAlign: 'center', color: '#666' }}>Loading...</p>
              ) : payments.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999' }}>No transactions yet</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Quiz Date</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Amount</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment._id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px' }}>
                            {new Date(payment.createdAt).toLocaleString()}
                          </td>
                          <td style={{ padding: '10px' }}>
                            {payment.quizDate}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            ₹{payment.amount}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <span style={{
                              padding: '5px 10px',
                              borderRadius: '5px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor: payment.status === 'SUCCESS' ? '#d4edda' : 
                                               payment.status === 'FAILED' ? '#f8d7da' : '#fff3cd',
                              color: payment.status === 'SUCCESS' ? '#155724' : 
                                     payment.status === 'FAILED' ? '#721c24' : '#856404'
                            }}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
