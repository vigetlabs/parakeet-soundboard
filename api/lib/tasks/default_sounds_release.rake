namespace :sounds do
  desc "Add default sounds - January 2026 release"
  task release_jan_2026: :environment do
    puts "Adding new default sounds (January 2026)..."
    new_sounds = [
      { name: 'Friday', file_path: 'happy-friday.mp3', tags: ["Positive", "Voice", "Celebration"], color: "#ff4bd8", emoji: "🏝️"},
      { name: 'Guuurl', file_path: 'guuurl.mp3', tags: ["Funny", "Meme", "Negative", "Smooth", "Voice", "Tommy"], color: "#00c8ff", emoji: "🤦‍♀️" },
      { name: 'Muted', file_path: 'uh-i-think-youre-muted.mp3', tags: ["Voice", "Tommy"], color: "#e90c13", emoji: "👂"},
      { name: 'TTT', file_path: 'its-ttt-yall.mp3', tags: ["Positive", "Celebration", "Funny", "Voice", "Tommy"], color: "#008573", emoji: "🤠"},
      { name: 'Womp', file_path: 'womp-womp-waaamp.mp3', tags: ["Negative", "Sad", "Funny", "Musical", "Meme", "Voice", "Tommy"], color: "#6200ad", emoji: "🫠"}
    ]
    new_sounds.each do |sound_data|
      existing = Sound.find_by(name: sound_data[:name], user: nil)

      if existing
        puts "Sound '#{sound_data[:name]}' already exists, skipping"
        next
      end

      sound = Sound.new(
        name: sound_data[:name],
        color: sound_data[:color],
        emoji: sound_data[:emoji],
        user: nil
      )

      file_path = Rails.root.join("db", "seeds", "audio", sound_data[:file_path])

      unless File.exist?(file_path)
        puts "File not found: #{sound_data[:file_path]}, skipping"
        next
      end

      sound.audio_file.attach(
        io: File.open(file_path),
        filename: sound_data[:file_path]
      )

      if sound.save
        sound_data[:tags].each do |tag_name|
          tag = Tag.find_or_create_by!(name: tag_name)
          sound.tags << tag unless sound.tags.include?(tag)
        end
        puts "Added: #{sound.name}"
      else
        puts "Failed: #{sound.errors.full_messages.join(', ')}"
      end
    end

    puts "Done!"
  end
end
