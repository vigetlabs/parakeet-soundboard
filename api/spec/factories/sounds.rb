FactoryBot.define do
  factory :sound do
    sequence(:name) { |n| "Sound #{n}" }
    color { "blue" }
    emoji { "🔊" }
    user_id { nil } # default as a public sound

    after(:build) do |sound|
      # Attach an audio file using fixture_file_upload
      sound.audio_file.attach(
        io: File.open(Rails.root.join("spec", "fixtures", "files", "seinfeld_test_audio.mp3")),
        filename: "seinfeld_test_audio.mp3",
        content_type: "audio/mpeg"
      )
    end
  end
end
