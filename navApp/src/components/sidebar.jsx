

const Sidebar = () => {
    return(
        <div className="sidebar">
            <h2>Options</h2>
            <label htmlFor="start">Choose your starting point:</label>
            <select name="start" id="start">
                <option value="test1">Test 1</option>
                <option value="test2">Test 2</option>
            </select>
            <br/>
            <label htmlFor="end">Choose your starting point:</label>
            <select name="end" id="end">
                <option value="test1">Test 1</option>
                <option value="test2">Test 2</option>
            </select>

        </div>
    );

};

export default Sidebar;