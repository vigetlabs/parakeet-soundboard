class SoundsController < ApplicationController
  before_action :authenticate_user!, except: [ :index, :show, :in_folders ]
  before_action :authorize_user!, only: [ :update, :destroy, :set_folders ]
  before_action :set_current_user

  def index
    if current_user
      sounds = Sound.where(user_id: nil).or(Sound.where(user: current_user))
    else
      sounds = Sound.where(user_id: nil)
    end
    render json: SoundSerializer.new(sounds, params: { scope: current_user }).serializable_hash.to_json
  end

  def my_sounds
    sounds = current_user.sounds
    render json: SoundSerializer.new(sounds, params: { scope: current_user }).serializable_hash.to_json
  end

  def in_folders
    if current_user
      folders = sound.folders.where(user_id: nil).or(sound.folders.where(user: current_user))
      render json: folders.pluck(:slug)
    else
      folders = sound.folders.where(user_id: nil)
      render json: folders.pluck(:slug)
    end
  end

  def show
    if sound.user_id.nil? || (sound.user == current_user)
      render json: SoundSerializer.new(sound, params: { scope: current_user }).serializable_hash.to_json
    else
      render json: { error: "Not authorized" }, status: :forbidden
    end
  end

  def create
    sound = Sound.new(sound_params.except(:folder_slugs))
    sound.user = current_user if user_signed_in?
    sound.folders = Folder.where(slug: sound_params[:folder_slugs], user: current_user) if sound_params[:folder_slugs].present?
    sound.audio_file.attach(sound_params[:audio_file])
    sound.tag_ids = sound_params[:tag_ids] if sound_params[:tag_ids]
    if sound.save
      render json: SoundSerializer.new(sound,  params: { scope: current_user }).serializable_hash.to_json, status: :created
    else
      render json: { errors: sound.errors }, status: :unprocessable_entity
    end
  end

  def update
    if sound.update(sound_params.except(:folder_slugs))
      sound.folders = Folder.where(slug: sound_params[:folder_slugs], user: current_user) if sound_params[:folder_slugs].present?
      render json: SoundSerializer.new(sound,  params: { scope: current_user }).serializable_hash.to_json
    else
      render json: { errors: sound.errors }, status: :unprocessable_entity
    end
  end

  # PATCH /sounds/:id/set_folders
  def set_folders
    folder_slugs = params[:folder_slugs] || []

    folders = Folder.where(slug: folder_slugs, user: current_user)

    sound.folders = folders
    sound.save!

    render json: { success: true, folder_slugs: sound.folders.pluck(:slug) }
  end

  def destroy
    sound.destroy
    head :no_content
  end

  private

  def sound
    @sound ||= Sound.find(params[:id])
  end

  def sound_params
    params.require(:sound).permit(:name, :audio_file, :color, :emoji, tag_ids: [], folder_slugs: [])
  end

  def authorize_user!
    if sound.user.present? && sound.user != current_user
      render json: { error: "Not authorized" }, status: :forbidden
    end
  end

  def set_current_user
    request.env["warden"].authenticate(scope: :user)
  end
end
