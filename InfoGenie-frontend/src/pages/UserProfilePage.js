import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../contexts/UserContext';
import { FiUser, FiStar, FiTrendingUp, FiGift, FiCalendar, FiAward } from 'react-icons/fi';
import { userAPI } from '../utils/api';

const ProfileContainer = styled.div`
  min-height: calc(100vh - 140px);
  padding: 20px;
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%);
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const ProfileHeader = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(168, 230, 207, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(168, 230, 207, 0.2);
  text-align: center;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #81c784 0%, #a5d6a7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
  font-size: 32px;
  box-shadow: 0 4px 16px rgba(129, 199, 132, 0.3);
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const UserName = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 8px;
`;

const UserEmail = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(168, 230, 207, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(168, 230, 207, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(168, 230, 207, 0.3);
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #81c784 0%, #a5d6a7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: white;
  font-size: 20px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
`;

const CheckinSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(168, 230, 207, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(168, 230, 207, 0.2);
  text-align: center;
`;

const CheckinTitle = styled.h3`
  font-size: 20px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const CheckinButton = styled.button`
  background: ${props => props.disabled ? '#ccc' : 'linear-gradient(135deg, #81c784 0%, #a5d6a7 100%)'};
  color: white;
  border: none;
  border-radius: 16px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(129, 199, 132, 0.3);
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? '0 4px 16px rgba(129, 199, 132, 0.3)' : '0 8px 24px rgba(129, 199, 132, 0.4)'};
  }
`;

const CheckinInfo = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: rgba(129, 199, 132, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(129, 199, 132, 0.2);
`;

const CheckinText = styled.p`
  margin: 0;
  color: #2e7d32;
  font-size: 14px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: #666;
`;

const ErrorMessage = styled.div`
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
  color: #d32f2f;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
  color: #388e3c;
  text-align: center;
`;

const UserProfilePage = () => {
  const { user } = useUser();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState('');
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // 获取QQ头像URL
  const getQQAvatar = (email) => {
    if (!email) return null;
    
    const qqDomains = ['qq.com', 'vip.qq.com', 'foxmail.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (qqDomains.includes(domain)) {
      const qqNumber = email.split('@')[0];
      if (/^\d+$/.test(qqNumber)) {
        return `http://q1.qlogo.cn/g?b=qq&nk=${qqNumber}&s=100`;
      }
    }
    
    return null;
  };

  useEffect(() => {
    fetchGameData();
  }, []);

  const fetchGameData = async () => {
    try {
      setLoading(true);
      
      const response = await userAPI.getGameData();

      if (response.data.success) {
        setGameData(response.data.data);
        setError('');
      } else {
        setError(response.data.message || '获取用户数据失败');
      }
    } catch (err) {
      console.error('获取用户数据失败:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    try {
      setCheckinLoading(true);
      setCheckinMessage('');
      setCheckinSuccess(false);
      
      const response = await userAPI.checkin();

      if (response.data.success) {
        setCheckinMessage(`签到成功！获得 ${response.data.data.coin_reward} 萌芽币和 ${response.data.data.exp_reward} 经验${response.data.data.level_up ? `，恭喜升级到 ${response.data.data.new_level} 级！` : ''}`);
        setCheckinSuccess(true);
        // 刷新用户数据
        fetchGameData();
      } else {
        setCheckinMessage(response.data.message || '签到失败');
        setCheckinSuccess(false);
      }
    } catch (err) {
      console.error('签到失败:', err);
      setCheckinMessage('网络错误，请稍后重试');
      setCheckinSuccess(false);
    } finally {
      setCheckinLoading(false);
    }
  };

  const calculateExpNeeded = (level) => {
    return Math.floor(100 * Math.pow(1.2, level));
  };

  if (loading) {
    return (
      <ProfileContainer>
        <Container>
          <LoadingSpinner>加载中...</LoadingSpinner>
        </Container>
      </ProfileContainer>
    );
  }

  if (error) {
    return (
      <ProfileContainer>
        <Container>
          <ErrorMessage>{error}</ErrorMessage>
        </Container>
      </ProfileContainer>
    );
  }

  const isCheckedInToday = gameData?.checkin_system?.['今日是否已签到'] || false;
  const consecutiveDays = gameData?.checkin_system?.['连续签到天数'] || 0;
  const expNeeded = calculateExpNeeded(gameData?.level || 0);
  const expProgress = ((gameData?.experience || 0) / expNeeded * 100).toFixed(1);
  const qqAvatarUrl = getQQAvatar(user?.email);

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  return (
    <ProfileContainer>
      <Container>
        <ProfileHeader>
          <Avatar>
            {qqAvatarUrl && !avatarError ? (
              <AvatarImage 
                src={qqAvatarUrl} 
                alt="用户头像" 
                onError={handleAvatarError}
              />
            ) : (
              <FiUser />
            )}
          </Avatar>
          <UserName>{user?.username || '用户'}</UserName>
          <UserEmail>{user?.email || ''}</UserEmail>
        </ProfileHeader>

        <StatsGrid>
          <StatCard>
            <StatIcon>
              <FiAward />
            </StatIcon>
            <StatValue>{gameData?.level || 0}</StatValue>
            <StatLabel>等级</StatLabel>
          </StatCard>

          <StatCard>
            <StatIcon>
              <FiTrendingUp />
            </StatIcon>
            <StatValue>{gameData?.experience || 0}</StatValue>
            <StatLabel>经验值 ({expProgress}%)</StatLabel>
          </StatCard>

          <StatCard>
            <StatIcon>
              <FiStar />
            </StatIcon>
            <StatValue>{gameData?.coins || 0}</StatValue>
            <StatLabel>萌芽币</StatLabel>
          </StatCard>

          <StatCard>
            <StatIcon>
              <FiCalendar />
            </StatIcon>
            <StatValue>{consecutiveDays}</StatValue>
            <StatLabel>连续签到天数</StatLabel>
          </StatCard>
        </StatsGrid>

        <CheckinSection>
          <CheckinTitle>
            <FiGift />
            每日签到
          </CheckinTitle>
          
          <CheckinButton 
            onClick={handleCheckin}
            disabled={isCheckedInToday || checkinLoading}
          >
            {checkinLoading ? '签到中...' : isCheckedInToday ? '今日已签到' : '立即签到'}
          </CheckinButton>

          <CheckinInfo>
            <CheckinText>
              签到奖励：300 萌芽币 + 200 经验
            </CheckinText>
            <CheckinText>
              升级公式：100 × 1.2^(等级)
            </CheckinText>
            {consecutiveDays > 0 && (
              <CheckinText>
                当前连续签到：{consecutiveDays} 天
              </CheckinText>
            )}
          </CheckinInfo>

          {checkinMessage && (
            checkinSuccess ? (
              <SuccessMessage>{checkinMessage}</SuccessMessage>
            ) : (
              <ErrorMessage>{checkinMessage}</ErrorMessage>
            )
          )}
        </CheckinSection>
      </Container>
    </ProfileContainer>
  );
};

export default UserProfilePage;