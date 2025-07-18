class Tag < ApplicationRecord
  has_and_belongs_to_many :sounds

  validates :name, presence: true, uniqueness: true
end
