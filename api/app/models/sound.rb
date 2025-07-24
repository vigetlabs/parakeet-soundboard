class Sound < ApplicationRecord
  has_and_belongs_to_many :tags
  has_one_attached :audio_file

  validates :name, presence: true
  validate :audio_file_presence

  def audio_file_presence
    errors.add(:audio_file, "must be attached") unless audio_file.attached?
  end
end
