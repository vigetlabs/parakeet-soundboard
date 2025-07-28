class Folder < ApplicationRecord
  belongs_to :user, optional: true
  has_and_belongs_to_many :sounds

  before_validation :set_slug, on: [ :create, :update ]

  validates :name, presence: true

  private

  def set_slug
    base_slug = name.parameterize
    candidate = base_slug
    count = 2

    while Folder.exists?(slug: candidate)
      candidate = "#{base_slug}-#{count}"
      count += 1
    end

    self.slug = candidate
  end
end
