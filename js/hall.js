.hall-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-top: 1.5rem;
}

@media (max-width: 1200px) {
    .hall-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .hall-grid {
        grid-template-columns: 1fr;
    }
}

.hall-box {
    background: var(--table-row-alt);
    border: 1px solid var(--table-border);
    border-radius: 2px;
    padding: 1.2rem;
    text-align: center;
    transition: all 0.3s;
}

.hall-box:hover {
    transform: translateY(-2px);
    border-color: var(--link-color);
}

.hall-image {
    width: 100%;
    height: 150px;
    background: var(--bg-color);
    border: 1px solid var(--table-border);
    margin-bottom: 0.8rem;
    border-radius: 2px;
    overflow: hidden;
}

.hall-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.hall-name {
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 0.4rem;
    color: var(--accent-color);
}

.hall-description {
    color: #888888;
    font-size: 0.8rem;
}
