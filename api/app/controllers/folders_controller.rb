class FoldersController < ApplicationController
  # before_action :authenticate_user!, except: [:index, :show]
  before_action :authenticate_user!, only: [ :my_folders ] # temporary until users
  # before_action :authorize_user!, only: [ :update, :destroy, :add_sound, :remove_sound ]
  before_action :set_current_user

  # GET /folders (default + a user's folder if signed in)
  def index
    if current_user
      folders = Folder.where(user_id: nil).or(Folder.where(user: current_user))
    else
      folders = Folder.where(user_id: nil)
    end
    render json: FolderSerializer.new(folders).serializable_hash.to_json
  end

  # GET /my_folders
  def my_folders
    folders = current_user.folders
    render json: FolderSerializer.new(folders).serializable_hash.to_json
  end

  # GET /folder_slug_list
  def folder_slug_list
    folders = Folder.where(user: [ current_user, nil ])
    folder_slugs = folders.select(:slug, :name, :id).map { |f| f.attributes }
    render json: folder_slugs
  end

  def get_name
    folder = Folder.find_by(slug: params[:slug])
    render json: { name: folder.name }
  end

  # GET /folders/:slug
  def show
    render json: FolderSerializer.new(folder).serializable_hash.to_json
  end

  # POST /folders
  def create
    folder = Folder.new(folder_params)
    folder.user = current_user if user_signed_in?

    if folder.save
      render json: FolderSerializer.new(folder).serializable_hash.to_json, status: :created
    else
      render json: { errors: folder.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH /folders/:slug
  def update
    if folder.update(folder_params)
      render json: FolderSerializer.new(folder).serializable_hash.to_json
    else
      render json: { errors: folder.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /folders/:slug
  def destroy
    folder.destroy
    head :no_content
  end

  # POST /folders/:slug/add_sound
  def add_sound
    sound = Sound.find_by(id: params[:sound_id])
    return render json: { error: "Sound not found" }, status: :not_found unless sound

    folder.sounds << sound unless folder.sounds.include?(sound)
    render json: FolderSerializer.new(folder).serializable_hash.to_json
  end

  # DELETE /folders/:slug/remove_sound
  def remove_sound
    sound = Sound.find_by(id: params[:sound_id])
    return render json: { error: "Sound not found" }, status: :not_found unless sound

    folder.sounds.delete(sound)
    render json: FolderSerializer.new(folder).serializable_hash.to_json
  end


  private

  def folder
    @folder ||= if current_user
      Folder.find_by(slug: params[:slug], user_id: current_user.id) ||
      Folder.find_by(slug: params[:slug], user_id: nil)
    else
      Folder.find_by!(slug: params[:slug], user_id: nil)
    end
  end

  def folder_params
    params.require(:folder).permit(:name, :slug, sound_ids: [])
  end

  def authorize_user!
    if folder.user.present? && folder.user != current_user
      render json: { error: "Not authorized" }, status: :forbidden
    end
  end

  def set_current_user
    request.env["warden"].authenticate(scope: :user)
  end
end
