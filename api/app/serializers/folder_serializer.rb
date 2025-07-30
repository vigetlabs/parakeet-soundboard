class FolderSerializer
  include JSONAPI::Serializer
  attributes :name, :slug

  attribute :sounds do |object|
    object.sounds.map do |sound|
      {
        id: sound.id,
        name: sound.name,
        user_id: sound.user_id,
        color: sound.color,
        emoji: sound.emoji,
        audio_file_url: (Rails.application.routes.url_helpers.rails_blob_url(sound.audio_file, only_path: true) if sound.audio_file.attached?),
        tags: sound.tags.map { |tag| { id: tag.id, name: tag.name, color: tag.color } }
      }
    end
  end
end
