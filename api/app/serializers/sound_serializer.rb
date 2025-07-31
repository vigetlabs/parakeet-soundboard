class SoundSerializer
  include JSONAPI::Serializer
  attributes :name, :user_id, :color, :emoji

  attribute :audio_file_url do |object|
    if object.audio_file.attached?
      Rails.application.routes.url_helpers.rails_blob_url(object.audio_file, only_path: true)
    end
  end
  attribute :tags do |object|
    object.tags.map { |tag| { id: tag.id, name: tag.name, color: tag.color } }
  end

  attribute :is_favorited do |object, params|
    user = params[:scope]
    next false unless user.present?
    user.favorite_folder.sounds.exists?(object.id)
  end
end
