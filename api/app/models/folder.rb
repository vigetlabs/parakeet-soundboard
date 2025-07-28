class Folder < ApplicationRecord
  belongs_to :user, optional: true
  has_and_belongs_to_many :sounds
  validates :name, presence: true
end
