class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :jwt_authenticatable, jwt_revocation_strategy: self

  validates :email, presence: true, uniqueness: true
  validates :username, presence: true, uniqueness: true
  has_many :sounds
  has_many :folders
end
