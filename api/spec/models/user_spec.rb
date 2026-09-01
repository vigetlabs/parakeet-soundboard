require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    let(:user) { User.create!(email: "user@example.com", password: "password123", username: "user1") }
    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email).case_insensitive }
    it { should validate_presence_of(:username) }
    it { should validate_uniqueness_of(:username) }
  end

  describe 'favorites folder' do
    it 'creates a favorites folder after user creation' do
      user = User.create!(email: "user@example.com", password: "password123", username: "user1")
      expect(user.favorite_folder).to be_present
      expect(user.favorite_folder.name).to eq("Favorites")
      expect(user.favorite_folder.is_favorite).to be true
    end
  end

  describe '.from_omniauth' do
    let(:auth) do
      OmniAuth::AuthHash.new(
        provider: 'google_oauth2',
        uid: '1234567890',
        info: {
          email: 'user@company.com',
          name: 'User Example'
        },
         extra: {
          raw_info: {
            email_verified: true,
            hd: 'company.com'
          }
        }
      )
    end
    it 'creates a user from omniauth' do
      created_user = nil
      expect { created_user = User.from_omniauth(auth) }.to change { User.count }.by(1)
      expect(created_user).to be_present
      expect(created_user.email).to eq('user@company.com')
      expect(created_user.needs_username).to be true
    end

    it 'finds an existing user by email and updates provider and uid if email is verified' do
      existing_user = User.create!(email: 'user@company.com', password: 'password123', username: 'CoolUser')
      user = User.from_omniauth(auth)
      expect(user).to eq(existing_user)
      expect(user.provider).to eq('google_oauth2')
      expect(user.uid).to eq('1234567890')
      expect(user.needs_username).to be false
      expect(User.count).to eq(1) # Ensure no new user is created
    end

    it 'sets a unique placeholder username' do
      user = User.from_omniauth(auth)
      expect(user.username).to eq('user')
      expect(user.needs_username).to be true

      same_name_auth = OmniAuth::AuthHash.new(
        provider: 'google_oauth2',
        uid: '0987654321',
        info: {
          email: 'user@gmail.com',
          name: 'User Ex'
        },
        extra: {
          raw_info: {
            email_verified: true
          }
        }
      )
      same_name_user = User.from_omniauth(same_name_auth)
      expect(same_name_user.username).to eq('user2') # The username should be unique
      expect(same_name_user.needs_username).to be true
    end

    it 'raises UntrustedGoogleAccount for a non-gmail address with no live Workspace hd' do
      untrusted_auth = OmniAuth::AuthHash.new(
        provider: 'google_oauth2',
        uid: '5551234567',
        info: {
          email: 'user@example.com',
          name: 'User Example'
        },
        extra: {
          raw_info: {
            email_verified: true
          }
        }
      )

      expect {
        expect { User.from_omniauth(untrusted_auth) }.to raise_error(User::UntrustedGoogleAccount)
      }.not_to change(User, :count)
    end
  end
end
