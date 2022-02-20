const UserIcon = ({ id, img, name, clickHandler }) => {
  return (
    <button
      onClick={() => {
        clickHandler(id)
      }}
      aria-label={name}
      className={img ? 'hasImage' : undefined}
      title={name}
    >
      {img ? (
        <span className="icon-wrapper">
          <img
            style={{ width: '25px', objectFit: 'contain' }}
            className="icon"
            src={img}
          />
        </span>
      ) : (
        <span className="icon-wrapper">
          <span className="name">{name}</span>
        </span>
      )}
    </button>
  )
}

export default UserIcon
