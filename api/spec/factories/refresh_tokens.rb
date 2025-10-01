FactoryBot.define do
  factory :refresh_token do
    sequence(:crypted_token) { |n| "refreshtoken#{n}" }
    user { nil }
    created_at { "2025-09-25 11:23:06" }
  end
end
