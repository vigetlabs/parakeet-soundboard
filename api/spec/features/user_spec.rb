require 'rails_helper'

describe 'User API', type: :request do
  let(:signup_params) do
    {
      user: {
        email: 'testuser@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        username: 'testuser'
      }
    }
  end

  it 'signs up a user and returns JWT token in headers' do
    post '/signup', params: signup_params.to_json, headers: { 'Content-Type' => 'application/json' }
    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)['status']['code']).to eq(200)
    expect(response.headers['Authorization']).to be_present
    expect(JSON.parse(response.body)['data']['email']).to eq('testuser@example.com')
  end

  it 'fails to sign up a user because email is already used' do
    User.create!(email: 'testuser@example.com', password: 'password123', username: 'testuser')
    post '/signup', params: signup_params.to_json, headers: { 'Content-Type' => 'application/json' }
    expect(response).to have_http_status(:unprocessable_entity)
    expect(JSON.parse(response.body)['status']['code']).to eq(422)
    expect(response.headers['Authorization']).to be_blank
    expect(JSON.parse(response.body)['status']['message']).to include('has already been taken')
  end

  it 'logs in a user and returns JWT token in headers' do
    User.create!(email: 'testuser@example.com', password: 'password123', username: 'testuser')
    login_params = {
      user: {
        email: 'testuser@example.com',
        password: 'password123'
      }
    }
    post '/login', params: login_params.to_json, headers: { 'Content-Type' => 'application/json' }
    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)['status']['code']).to eq(200)
    expect(response.headers['Authorization']).to be_present
    expect(JSON.parse(response.body)['status']['data']['user']['email']).to eq('testuser@example.com')
  end

  it 'logs out a user and revokes JWT token' do
    User.create!(email: 'testuser@example.com', password: 'password123', username: 'testuser')
    # Log in to get token
    login_params = {
      user: {
        email: 'testuser@example.com',
        password: 'password123'
      }
    }
    post '/login', params: login_params.to_json, headers: { 'Content-Type' => 'application/json' }
    token = response.headers['Authorization']
    # Log out
    delete '/logout', headers: { 'Authorization' => token }
    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)['message']).to eq('Logged out successfully.')
  end
end
