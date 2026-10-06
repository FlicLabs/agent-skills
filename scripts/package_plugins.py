"""Build reviewable ChatGPT plugin ZIPs without secrets or checkout instructions."""
from pathlib import Path
import json
import re
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
SELECTION = {
    'geminilaunch': ['geminilaunch-publish', 'geminilaunch-update'],
    'facesearchai': ['facesearchai-api-integration'],
}

def chatgpt_text(text):
    text = re.sub(r'\?utm_source=skills_sh&utm_medium=agent_skill&utm_campaign=[a-z_]+', '', text)
    text = text.replace('Outside ChatGPT, when the user needs an unavailable paid capability, the website\'s pricing page is https://www.geminilaunch.com/pricing. The user completes any purchase themselves.', '')
    text = text.replace('Outside ChatGPT, a user needing editing access can review current terms at https://www.geminilaunch.com/pricing and complete any purchase on the website themselves.', '')
    text = text.replace('Outside ChatGPT, users without API access can obtain it through FaceSearchAI\'s website and store the resulting key themselves. ', '')
    text = text.replace('- https://www.facesearchai.com/pricing\n', '')
    return text

def main():
    DIST.mkdir(exist_ok=True)
    for product, skills in SELECTION.items():
        source = ROOT / 'integrations' / 'chatgpt' / product
        manifest = json.loads((source / 'plugin.json').read_text())
        target = DIST / manifest['name']
        if target.exists():
            shutil.rmtree(target)
        shutil.copytree(source, target)
        for name in skills:
            shutil.copytree(ROOT / 'skills' / name, target / 'skills' / name)
        for path in target.rglob('*'):
            if path.is_file() and path.suffix in {'.md', '.yaml'}:
                path.write_text(chatgpt_text(path.read_text()))
        shutil.copy(ROOT / 'LICENSE', target / 'LICENSE')
        path = DIST / f"{manifest['name']}-{manifest['version']}.zip"
        with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as archive:
            for file in sorted(target.rglob('*')):
                if file.is_file():
                    archive.write(file, file.relative_to(target))
        print(path)

if __name__ == '__main__':
    main()
