import re

def filter_css_by_id(css_content, target_id):
    rule_pattern = re.compile(r'(#' + re.escape(target_id) + r'[^{]*\{[^}]*\})')
    matching_rules = rule_pattern.findall(css_content)
    return '\n'.join(matching_rules)

def main():
    target_id = "jupiter-terminal"
    files = ["./public/main-3.1.0-Jupiter.css", "./public/main-3.1.0-Tailwind.css"]
    for file in files:
        with open(file, 'r') as f:
            css_content = f.read()
        
        filtered_css = filter_css_by_id(css_content, target_id)
        
        with open(file, 'w') as f:
            f.write(filtered_css)

if __name__ == "__main__":
    main()