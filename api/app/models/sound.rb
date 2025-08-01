class Sound < ApplicationRecord
  has_and_belongs_to_many :tags
  has_and_belongs_to_many :folders
  has_one_attached :audio_file
  belongs_to :user, optional: true

  validates :name, presence: true
  validate :audio_file_presence

  def folder_slugs
    folders.pluck(:slug)
  end
  
  def folder_slugs=(slugs)
    if slugs.present?
      # Filter out empty strings and find folders by slug
      valid_slugs = slugs.reject(&:blank?)
      self.folders = Folder.where(slug: valid_slugs)
    else
      self.folders = []
    end
  end

  def audio_file_presence
    errors.add(:audio_file, "must be attached") unless audio_file.attached?
  end
end
