require 'rails_helper'

RSpec.describe "Folders API", type: :request do
  let!(:sounds) { create_list(:sound, 3) }
  let(:sound_ids) { sounds.map(&:id) }
  let(:user) { User.create!(email: "user@example.com", password: "password123", username: "user1") }
  let(:auth_headers) do
    post "/login", params: { user: { email: user.email, password: "password123" } }.to_json, headers: { "Content-Type" => "application/json" }
    { "Authorization" => response.headers["Authorization"] }
  end

 describe "GET /folders" do
    it "returns all folders" do
      Folder.create!(name: "Test Folder")
      get "/folders"
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["data"]).to be_an(Array)
    end
  end


  describe "GET /my_folders" do
    it "returns user's folders" do
      folder = Folder.create!(name: "Test Folder Belongs to User", user: user)
      get "/my_folders", headers: auth_headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["data"].first["id"]).to eq(folder.id.to_s)
      expect(JSON.parse(response.body)["data"].first["attributes"]["name"]).to eq("Test Folder Belongs to User")
    end
  end

  describe "GET /folders/:id" do
    it "returns a (default) folder" do
      folder = Folder.create!(name: "Test Folder")
      get "/folders/#{folder.id}"
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["data"]["id"]).to eq(folder.id.to_s)
    end
  end

  describe "POST /folders" do
    let(:valid_attributes) { { folder: { name: "Meeting", sound_ids: sound_ids } } }

    it "creates a folder with sounds" do
      expect {
        post "/folders", params: valid_attributes
      }.to change(Folder, :count).by(1)

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["attributes"]["name"]).to eq("Meeting")
    end
  end

  describe "PATCH /folders/:id" do
    let(:valid_attributes) { { folder: { name: "Updated Folder" } } }

    it "updates the folder" do
      folder = Folder.create!(name: "To Update")
      patch "/folders/#{folder.id}", params: valid_attributes
      expect(response).to have_http_status(:ok)
      expect(Folder.find(folder.id).name).to eq("Updated Folder")
    end
  end

  describe "DELETE /folders/:id" do
    it "deletes the folder" do
      folder = Folder.create!(name: "To Delete")

      expect {
        delete "/folders/#{folder.id}"
      }.to change(Folder, :count).by(-1)

      expect(response).to have_http_status(:no_content)
      expect(Folder.find_by(id: folder.id)).to be_nil
    end
  end
end
