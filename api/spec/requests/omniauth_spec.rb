require 'rails_helper'

RSpec.describe 'Google OmniAuth', type: :request do
  before do
    OmniAuth.config.test_mode = true
  end

  after do
    OmniAuth.config.mock_auth[:google_oauth2] = nil
  end

  def mock_google_auth(email:, uid: '1234567890', email_verified: true)
    OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new(
      provider: 'google_oauth2',
      uid: uid,
      info: { email: email, name: 'Test User' },
      extra: { raw_info: { email_verified: email_verified } }
    )
  end

  def redirect_fragment_params
    uri = URI.parse(response.headers['Location'])
    Rack::Utils.parse_nested_query(uri.fragment)
  end

  describe 'GET /auth/google_oauth2/callback' do
    it 'creates a new user, signs them in, and redirects with a token' do
      mock_google_auth(email: 'newuser@example.com')

      expect {
        get '/auth/google_oauth2/callback'
      }.to change(User, :count).by(1)

      user = User.find_by(email: 'newuser@example.com')
      expect(user).to be_present
      expect(user.provider).to eq('google_oauth2')
      expect(user.uid).to eq('1234567890')
      expect(user.needs_username).to be true
      expect(user.refresh_tokens.count).to eq(1)

      expect(response).to have_http_status(:found)
      expect(response.headers['Location']).to start_with("#{ENV.fetch('FRONTEND_URL')}/auth/callback")

      params = redirect_fragment_params
      expect(params['token']).to be_present
      expect(params['refresh_token']).to be_present
    end

    it 'signs in an existing user matched by provider and uid without creating a new one' do
      existing = User.create!(
        email: 'returning@example.com', password: 'password123', username: 'returning',
        provider: 'google_oauth2', uid: '1234567890'
      )
      mock_google_auth(email: 'returning@example.com')

      expect {
        get '/auth/google_oauth2/callback'
      }.not_to change(User, :count)

      expect(response).to have_http_status(:found)
      params = redirect_fragment_params
      expect(params['token']).to be_present
      expect(existing.refresh_tokens.count).to eq(1)
    end

    it 'links an existing password account when the email is verified' do
      existing = User.create!(email: 'linkme@example.com', password: 'password123', username: 'linkme')
      mock_google_auth(email: 'linkme@example.com', uid: 'new-uid-999')

      expect {
        get '/auth/google_oauth2/callback'
      }.not_to change(User, :count)

      existing.reload
      expect(existing.provider).to eq('google_oauth2')
      expect(existing.uid).to eq('new-uid-999')
      expect(existing.needs_username).to be false

      expect(response).to have_http_status(:found)
      expect(redirect_fragment_params['token']).to be_present
    end

    it 'refuses to link an existing password account when the email is unverified' do
      existing = User.create!(email: 'unverified@example.com', password: 'password123', username: 'unverified')
      mock_google_auth(email: 'unverified@example.com', uid: 'new-uid-888', email_verified: false)

      expect {
        get '/auth/google_oauth2/callback'
      }.not_to change(User, :count)

      existing.reload
      expect(existing.provider).to be_nil
      expect(existing.uid).to be_nil

      expect(response).to have_http_status(:found)
      expect(response.headers['Location']).to eq("#{ENV.fetch('FRONTEND_URL')}/login?error=email_exists")
    end

    it 'redirects to login with an error when authentication fails' do
      OmniAuth.config.mock_auth[:google_oauth2] = :invalid_credentials

      get '/auth/google_oauth2/callback'

      expect(response).to have_http_status(:found)
      expect(response.headers['Location']).to eq("#{ENV.fetch('FRONTEND_URL')}/login?error=sso_failed")
    end
  end
end
