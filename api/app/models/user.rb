class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :jwt_authenticatable, jwt_revocation_strategy: self

  validates :email, presence: true, uniqueness: true
  validates :username, presence: true, uniqueness: true
  has_many :sounds
  has_many :folders
  has_many :refresh_tokens, dependent: :delete_all
  has_one :favorite_folder, -> { where(is_favorite: true) }, class_name: "Folder"
  after_create :create_favorites_folder
  def create_favorites_folder
    folders.create!(name: "Favorites", is_favorite: true)
  end
end
