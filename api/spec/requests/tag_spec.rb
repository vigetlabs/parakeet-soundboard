require 'rails_helper'

RSpec.describe "Tags API", type: :request do
  let!(:tags) { create_list(:tag, 3) }
  let(:tag_id) { tags.first.id }

  describe "GET /tags" do
    it "returns all tags" do
      get "/tags"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"].length).to eq(3)
    end
  end

  describe "GET /tags/:id" do
    it "returns a single tag" do
      get "/tags/#{tag_id}"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["id"]).to eq(tag_id.to_s)
    end
  end

  describe "POST /tags" do
    let(:valid_attributes) { { tag: { name: "Funny", color: "blue" } } }

    it "creates a tag" do
      expect {
        post "/tags", params: valid_attributes
      }.to change(Tag, :count).by(1)

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["attributes"]["name"]).to eq("Funny")
    end
  end

  describe "PATCH /tags/:id" do
    let(:valid_attributes) { { tag: { name: "Updated Name" } } }

    it "updates the tag" do
      patch "/tags/#{tag_id}", params: valid_attributes
      expect(response).to have_http_status(:ok)
      expect(Tag.find(tag_id).name).to eq("Updated Name")
    end
  end

  describe "DELETE /tags/:id" do
    it "deletes the tag" do
      tag = Tag.create!(name: "Funny")

    expect {
      delete "/tags/#{tag.id}"
    }.to change(Tag, :count).by(-1)
      expect(response).to have_http_status(:no_content)
      expect(Tag.find_by(id: tag.id)).to be_nil
    end
  end
end
