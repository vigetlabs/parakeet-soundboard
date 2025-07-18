class Sound < ApplicationRecord
  has_and_belongs_to_many :tags

  validates :name, :file_url, presence: true
end
