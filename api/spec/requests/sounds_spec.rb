require 'rails_helper'

RSpec.describe "Sounds API", type: :request do
  let(:audio) { fixture_file_upload(Rails.root.join("spec/fixtures/files/seinfeld_test_audio.mp3"), "audio/mpeg") }
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

  describe "GET /sounds/:id" do
    it "returns a sound" do
      sound = Sound.create!(name: "Test Sound", audio_file: audio)
      get "/sounds/#{sound.id}"
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["data"]["id"]).to eq(sound.id.to_s)
    end
  end

  describe "POST /sounds" do
    it "creates a sound with an audio file" do
      post "/sounds", params: { sound: valid_attributes }
      expect(response).to have_http_status(:created)
      data = JSON.parse(response.body)["data"]["attributes"]
      expect(data["name"]).to eq("Test Sound")
      expect(data["audio_file_url"]).to be_present
    end

    it "returns errors for missing audio file" do
      post "/sounds", params: { sound: { name: "No Audio" } }
      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)["errors"]).to be_present
      expect(JSON.parse(response.body)["errors"]["audio_file"]).to include("must be attached")
    end
  end

  describe "PATCH /sounds/:id" do
    it "updates a sound name" do
      sound = Sound.create!(name: "Old Name", audio_file: audio)
      patch "/sounds/#{sound.id}", params: { sound: { name: "New Name" } }
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["data"]["attributes"]["name"]).to eq("New Name")
    end
  end

  describe "DELETE /sounds/:id" do
    it "deletes a sound" do
      sound = Sound.create!(name: "Delete Me", audio_file: audio)
      delete "/sounds/#{sound.id}"
      expect(response).to have_http_status(:no_content)
      expect(Sound.find_by(id: sound.id)).to be_nil
    end
  end
end
