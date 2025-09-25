# spec/requests/refresh_token_flow_spec.rb
require 'rails_helper'

RSpec.describe 'Refresh Token Flow', type: :request do
  let(:user) { User.create!(email: "user@example.com", password: "password123", username: "user1") }

  describe 'complete refresh flow' do
    it 'allows token refresh and subsequent API usage' do
      post '/login', params: {
        user: { email: user.email, password: user.password }
      }

      expect(response).to have_http_status(:ok)
      access_token = response.headers['Authorization'].gsub('Bearer ', '')
      refresh_token = JSON.parse(response.body).dig('status', 'data', 'refresh_token')

      get '/users/show', headers: {
        'Authorization' => "Bearer #{access_token}"
      }
      expect(response).to have_http_status(:ok)

      post '/refresh', params: { refresh_token: refresh_token }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      new_access_token = json['access_token']
      new_refresh_token = json['refresh_token']

      get '/users/show', headers: {
        'Authorization' => "Bearer #{new_access_token}"
      }
      expect(response).to have_http_status(:ok)

      # Old refresh token should be invalid
      post '/refresh', params: { refresh_token: refresh_token }
      expect(response).to have_http_status(:unauthorized)

      post '/refresh', params: { refresh_token: new_refresh_token }
      expect(response).to have_http_status(:ok)
    end
  end
end
