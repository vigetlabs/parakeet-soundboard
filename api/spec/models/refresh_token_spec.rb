require 'rails_helper'

RSpec.describe RefreshToken, type: :model do
  let(:user) { User.create!(email: "user@example.com", password: "password123", username: "user1") }

  subject { RefreshToken.new(user: user) }


  describe 'associations' do
    it { should belong_to(:user) }
  end

  describe 'validations' do
    it { should validate_uniqueness_of(:crypted_token) }
  end

  describe 'callbacks' do
    it 'sets crypted_token before creation' do
      refresh_token = RefreshToken.new(user: user)
      expect(refresh_token.crypted_token).to be_nil

      refresh_token.save!

      expect(refresh_token.crypted_token).to be_present
      expect(refresh_token.token).to be_present
    end
  end

  describe '.find_by_token' do
    let!(:refresh_token) { user.refresh_tokens.create! }

    it 'finds token by unhashed token value' do
      found_token = RefreshToken.find_by_token(refresh_token.token)
      expect(found_token).to eq(refresh_token)
    end

    it 'returns nil for invalid token' do
      found_token = RefreshToken.find_by_token('invalid_token')
      expect(found_token).to be_nil
    end
  end
end
