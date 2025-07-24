require 'rails_helper'

RSpec.describe "Sounds API", type: :request do
  let(:audio) { fixture_file_upload(Rails.root.join("spec/fixtures/files/seinfeld_test_audio.mp3"), "audio/mpeg") }
  let(:user) { User.create!(email: "user@example.com", password: "password123", username: "user1") }
  let(:auth_headers) do
    post "/login", params: { user: { email: user.email, password: "password123" } }.to_json, headers: { "Content-Type" => "application/json" }
    { "Authorization" => response.headers["Authorization"] }
  end
  let(:valid_attributes) do
    {
      name: "Test Sound",
      audio_file: audio
    }
  end

  describe "GET /sounds" do
    it "returns all sounds" do
      Sound.create!(name: "Test Sound", audio_file: audio)
      get "/sounds"
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["data"]).to be_an(Array)
    end
  end

  describe "GET /my_sounds" do
    it "returns user's sounds" do
      sound = Sound.create!(name: "Test Sound Belongs to User", audio_file: audio, user: user)
      get "/my_sounds", headers: auth_headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["data"].first["id"]).to eq(sound.id.to_s)
      expect(JSON.parse(response.body)["data"].first["attributes"]["name"]).to eq("Test Sound Belongs to User")
    end
  end

  describe "GET /sounds/:id" do
    it "returns a (default) sound" do
      sound = Sound.create!(name: "Test Sound", audio_file: audio)
      get "/sounds/#{sound.id}"
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["data"]["id"]).to eq(sound.id.to_s)
    end

    it "returns forbidden for another user's private sound" do
      other_user = User.create!(email: "other@example.com", password: "password123", username: "otheruser")
      sound = Sound.create!(name: "Private Sound", audio_file: audio, user: other_user)
      get "/sounds/#{sound.id}", headers: auth_headers
      expect(response).to have_http_status(:forbidden)
      expect(JSON.parse(response.body)["error"]).to eq("Not authorized")
    end
  end

  describe "POST /sounds" do
    it "creates a sound with an audio file for the current user" do
      post "/sounds", params: { sound: valid_attributes }, headers: auth_headers
      expect(response).to have_http_status(:created)
      data = JSON.parse(response.body)["data"]["attributes"]
      expect(data["name"]).to eq("Test Sound")
      expect(data["audio_file_url"]).to be_present
    end

    it "returns unauthorized if not logged in" do
      post "/sounds", params: { sound: valid_attributes }
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns errors for missing audio file" do
      post "/sounds", params: { sound: { name: "No Audio" } }, headers: auth_headers
      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)["errors"]).to be_present
      expect(JSON.parse(response.body)["errors"]["audio_file"]).to include("must be attached")
    end
  end

  describe "PATCH /sounds/:id" do
    it "updates a sound name if owner" do
      post "/sounds", params: { sound: valid_attributes }, headers: auth_headers
      sound_id = JSON.parse(response.body)["data"]["id"]
      patch "/sounds/#{sound_id}", params: { sound: { name: "New Name" } }, headers: auth_headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["data"]["attributes"]["name"]).to eq("New Name")
    end

    it "returns forbidden if not owner" do
      other_user = User.create!(email: "other@example.com", password: "password123", username: "otheruser")
      sound = Sound.create!(name: "Not my sound", audio_file: audio, user: other_user)
      patch "/sounds/#{sound.id}", params: { sound: { name: "Attempted Rename" } }, headers: auth_headers
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "DELETE /sounds/:id" do
    it "deletes a sound if owner" do
      post "/sounds", params: { sound: valid_attributes }, headers: auth_headers
      sound_id = JSON.parse(response.body)["data"]["id"]
      delete "/sounds/#{sound_id}", headers: auth_headers
      expect(response).to have_http_status(:no_content)
      expect(Sound.find_by(id: sound_id)).to be_nil
    end

    it "returns forbidden if not owner" do
      other_user = User.create!(email: "other@example.com", password: "password123", username: "otheruser")
      sound = Sound.create!(name: "Not my sound", audio_file: audio, user: other_user)
      delete "/sounds/#{sound.id}", headers: auth_headers
      expect(response).to have_http_status(:forbidden)
    end
  end
end
